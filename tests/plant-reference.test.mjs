import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { claimErrors, recordErrors, publicClaims, generateListing } from '../lib/plant-reference-policy.mjs';
const pilot=JSON.parse(fs.readFileSync(new URL('../data/plant-reference/pilot.json',import.meta.url)));
const today='2026-09-12';
const clone = x=>structuredClone(x);
test('pilot has five unique canonical taxa and exact product links',()=>{
 assert.equal(pilot.records.length,5); assert.equal(new Set(pilot.records.map(r=>r.taxonKey)).size,5);
 assert.equal(new Set(pilot.links.map(l=>l.productId)).size,5);
 for(const l of pilot.links) assert.ok(pilot.records.find(r=>r._id===l.plant._ref && r.taxonKey===l.taxonKey));
 for(const r of pilot.records) assert.deepEqual(recordErrors(r,today),[]);
});
test('pending records cannot generate automatic listing copy',()=>{
 for(const r of pilot.records) assert.equal(generateListing(r,pilot.links.find(l=>l.taxonKey===r.taxonKey),today).ready,false);
});
test('supported and conflicting safety claims never enter public claims',()=>{
 const r=clone(pilot.records[0]); const safety=r.claims.find(c=>c.category==='safety');
 for(const status of ['supported','unverified','conflicting','needs recheck']) {safety.status=status; assert.ok(!publicClaims(r,today).some(c=>c._key===safety._key));}
});
test('same original source is not independent corroboration',()=>{
 const c=clone(pilot.records[0].claims.find(c=>c.category==='safety')); c.evidence[1].originGroup=c.evidence[0].originGroup;
 assert.ok(claimErrors(c,today).some(x=>x.includes('corroboration')));
});
test('unread sources, missing citations and expired reviews fail closed',()=>{
 const original=pilot.records[0].claims[0];
 for(const mutate of [c=>c.evidence=[], c=>c.evidence[0].read=false, c=>c.evidence[0].url='javascript:alert(1)',c=>c.recheckBy='2020-01-01',c=>c.reviewer=null]) {
  const c=clone(original); mutate(c); assert.ok(claimErrors(c,today).length);
 }
});
test('no invented unknowns or overwriting inventory in generation',()=>{
 const r=clone(pilot.records[0]); r.status='approved'; r.blockers=[];
 const l={...clone(pilot.links[0]),status:'approved',price:'19.00',stock:18,variants:[{title:'4"'}],specimenHeight:null};
 const before=JSON.stringify({r,l});
 const generated=generateListing(r,l,today); assert.equal(generated.ready,true);
 assert.equal(JSON.stringify({r,l}),before);
 assert.deepEqual(Object.keys(generated).sort(),['copy','ready','reviewFlags']);
 for (const row of generated.copy) {
   assert.deepEqual(Object.keys(row).sort(),['category','claimId','sources','text']);
   assert.equal(row.text,r.claims.find(c=>c._key===row.claimId).text);
 }
 assert.ok(!JSON.stringify(generated.copy).includes('humidity'));
 assert.ok(!JSON.stringify(generated.copy).includes('50%'));
});
test('mismatched product or unresolved safety blocks approval',()=>{
 const r=clone(pilot.records[1]);r.status='approved';r.blockers=[];
 assert.ok(recordErrors(r,today).includes('Unresolved consequential claims'));
 assert.equal(generateListing(r,{...pilot.links[0],status:'approved'},today).ready,false);
});
test('actionable processing cannot pass without exact method and review',()=>{
 const c={...clone(pilot.records[0].claims.find(c=>c.category==='safety')),category:'processing',actionable:true,processing:{species:'Jatropha podagrica'}};
 assert.ok(claimErrors(c,today).some(x=>x.includes('exact authoritative method')));
});
test('genus warning remains explicit and indoor/outdoor size stays scoped',()=>{
 const hip=publicClaims(pilot.records[3],today).find(c=>c.category==='safety');assert.equal(hip.scope.level,'genus');assert.match(hip.text,/Genus-level/);
 const size=publicClaims(pilot.records[0],today).find(c=>c.field==='size');assert.match(size.scope.environment,/indoor.*native/);
});

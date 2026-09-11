import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { isProductInCollection } from '../lib/collectionMembership.js';

test('collection matching supports fallback tags, categories and empty collections', () => {
  assert.equal(isProductInCollection({tags:['orchid']}, 'orchids'), true);
  assert.equal(isProductInCollection({categories:['art']}, 'stickers-art'), true);
  assert.equal(isProductInCollection({tags:['substrate']}, 'terrarium-vivarium'), true);
  assert.equal(isProductInCollection({collectionHandles:['bulbs']}, 'bulbs'), true);
  assert.equal(isProductInCollection({name:'Tropical plant'}, 'seeds'), false);
});

test('sitemap request emits XML with products, articles and only populated collections', async () => {
  const source=readFileSync(new URL('../pages/sitemap.xml.js',import.meta.url),'utf8').replace(/^import .*;\r?\n/gm,'').replace('export async function','async function').replace('export default SiteMap;','');
  let output='',headers={};
  const context=vm.createContext({isProductInCollection,getAllProducts:async()=>[{slug:'test-orchid',name:'Orchid',tags:['orchid'],collectionHandles:['orchids']}],getAlmanacArticles:async()=>[{handle:'plant-care'}]});
  vm.runInContext(source,context);
  await context.getServerSideProps({res:{setHeader(k,v){headers[k]=v},write(s){output+=s},end(){}}});
  assert.equal(headers['Content-Type'],'text/xml');
  assert.ok(output.startsWith('<?xml'));
  for(const path of ['/product/test-orchid','/almanac/plant-care','/collections/orchids','/gallery'])assert.ok(output.includes(`<loc>https://thebotanicalbazaar.com${path}</loc>`));
  assert.ok(!output.includes('/collections/seeds</loc>'));
  assert.ok(!output.includes('/orchids-gallery</loc>'));
});

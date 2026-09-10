import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getStore} from '@netlify/blobs';

test('upgraded SDK preserves conditional writes used to prevent duplicate restock emails',async()=>{
 const requests=[];
 const store=getStore({name:'sdk-contract-test',siteID:'test-site',token:'test-token',consistency:'strong',edgeURL:'https://blobs.example.test',uncachedEdgeURL:'https://blobs.example.test',fetch:async(url,options)=>{requests.push({url:String(url),...options});return new Response(null,{status:requests.length===2?412:200,headers:{etag:'test-etag'}})}});
 const first=await store.setJSON('record',{state:'pending'},{onlyIfNew:true});
 assert.equal(first.modified,true);
 const duplicate=await store.setJSON('record',{state:'pending'},{onlyIfNew:true});
 assert.equal(duplicate.modified,false);
 const updated=await store.setJSON('record',{state:'sent'},{onlyIfMatch:'test-etag'});
 assert.equal(updated.modified,true);
 assert.equal(requests.length,3);
 assert.ok(JSON.stringify(requests[0]).includes('If-None-Match') || JSON.stringify(requests[0]).includes('if-none-match'));
 assert.ok(JSON.stringify(requests[2]).includes('test-etag'));
});

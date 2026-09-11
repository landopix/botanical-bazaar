import {test} from 'node:test';
import assert from 'node:assert/strict';
import {restockEmail} from '../lib/restockEmails.js';
import {restockSendContent} from '../lib/restockRuntime.js';
const record={name:'Plant <specimen>',variantTitle:'1 Gallon',slug:'test-plant',variantId:'gid://shopify/ProductVariant/1',id:'a'.repeat(64),token:'b'.repeat(64),type:'item_waitlist'};
test('plant alerts select the published Resend templates and exact selection links',()=>{
 for(const [phase,id] of [['confirmation','plant-waitlist-confirmation-v1'],['restock','plant-back-in-stock-v1']]){
  const message=restockEmail(record,phase),send=restockSendContent(message);
  assert.equal(send.template.id,id);
  assert.equal(send.template.variables.PLANT_NAME,'Plant &lt;specimen&gt; — 1 Gallon');
  assert.match(send.template.variables.PRODUCT_URL,/variant=gid%3A/);
  assert.match(send.template.variables.CANCEL_URL,/restock-unsubscribe\?id=/);
  assert.equal(send.html,undefined);assert.equal(send.text,undefined);
 }
});
test('previously queued HTML deliveries retain their exact retry payload',()=>{
 const message={subject:'Saved',html:'<p>Saved</p>',text:'Saved'};
 assert.equal(restockSendContent(message),message);
});

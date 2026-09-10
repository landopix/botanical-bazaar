import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getRecommendedProducts} from '../lib/productRecommendations.js';
const current={slug:'current',categories:['Orchid'],tags:['Rare']};
test('recommendations retain scoring, stable ties, exclusions and eight-item limit',()=>{
 const products=[current,{slug:'tag',tags:['rare']},{slug:'category',categories:['orchid']},{slug:'both',categories:['ORCHID'],tags:['RARE']},...Array.from({length:10},(_,i)=>({slug:`other-${i}`})),{slug:'sold',availableForSale:false}];
 const before=JSON.stringify(products);
 assert.deepEqual(getRecommendedProducts(current,products).map(p=>p.slug),['both','category','tag','other-0','other-1','other-2','other-3','other-4']);
 assert.equal(JSON.stringify(products),before);
});
test('small catalogs preserve sold-out fallback and complete product data',()=>{
 const available={slug:'available',variants:[{id:'v1',price:10}],description:'Keep details for wishlist'};
 const sold={slug:'sold',availableForSale:false};
 assert.deepEqual(getRecommendedProducts(current,[current,sold,available]),[available,sold]);
 assert.deepEqual(getRecommendedProducts(null,[]),[]);
 assert.deepEqual(getRecommendedProducts(current,[current]),[]);
});

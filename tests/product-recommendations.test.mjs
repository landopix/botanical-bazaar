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

test('T-014: sold-out products stay linked in recommendations, ranked after in-stock items',()=>{
 // Equal scores: in-stock items come first, sold-out items follow but are included.
 const products=[
   {slug:'sold-twin',tags:['rare'],availableForSale:false},
   {slug:'in-stock-twin',tags:['rare']},
   {slug:'sold-low-stock',quantity:0},
   {slug:'plain'},
 ];
 const result=getRecommendedProducts({slug:'current',tags:['rare']},products).map(p=>p.slug);
 assert.ok(result.includes('sold-twin'),'sold-out product with shared tags must stay linked');
 assert.ok(result.includes('sold-low-stock'),'sold-out product must stay linked');
 assert.ok(result.indexOf('in-stock-twin')<result.indexOf('sold-twin'),'in-stock ranks before sold-out');
 // Availability grouping is the primary sort; relevance score orders within groups.
 assert.deepEqual(result,['in-stock-twin','plain','sold-twin','sold-low-stock']);
});

test('T-014: availability outranks relevance score within the 8-item window',()=>{
 // A sold-out product with a HIGH score must still rank below in-stock items,
 // but must appear in the carousel when there is room.
 const products=[
   {slug:'sold-strong',categories:['orchid'],tags:['rare'],availableForSale:false},
   ...Array.from({length:4},(_,i)=>({slug:`in-stock-weak-${i}`})),
 ];
 const result=getRecommendedProducts({slug:'current',categories:['Orchid'],tags:['Rare']},products).map(p=>p.slug);
 assert.deepEqual(result,['in-stock-weak-0','in-stock-weak-1','in-stock-weak-2','in-stock-weak-3','sold-strong']);
});

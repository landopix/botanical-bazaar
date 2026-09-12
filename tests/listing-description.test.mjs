import test from 'node:test';
import assert from 'node:assert/strict';
import {descriptionBlocks} from '../lib/listing-description.mjs';
test('reviewed headings and exact HTTPS citations survive description rendering',()=>{
 const blocks=descriptionBlocks('<h3>Safety</h3><p>Poisonous if eaten.</p><ul><li><a href="https://example.org/plant?x=1&amp;y=2">Source &amp; publisher</a></li></ul>');
 assert.equal(blocks[0].heading,true);assert.equal(blocks[1].text,'Poisonous if eaten.');
 assert.deepEqual(blocks[2].links,[{href:'https://example.org/plant?x=1&y=2',label:'Source & publisher'}]);
});
test('active HTML and unsafe URL schemes cannot become rendered attributes',()=>{
 const [block]=descriptionBlocks('<p onclick="alert(1)"><img src=x onerror=alert(1)><a href="javascript:alert(1)">Bad</a> &lt;script&gt;</p>');
 assert.deepEqual(block.links,[]);assert.equal(block.text,'Bad <script>');
 assert.deepEqual(Object.keys(block).sort(),['heading','links','text']);
});

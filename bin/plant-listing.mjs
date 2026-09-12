import fs from 'node:fs';
import {generateListing} from '../lib/plant-reference-policy.mjs';
const [bundlePath,handle]=process.argv.slice(2);
if(!bundlePath || !handle) { console.error('Usage: node bin/plant-listing.mjs reviewed-bundle.json product-handle');process.exit(2); }
const bundle=JSON.parse(fs.readFileSync(bundlePath,'utf8'));
const links=bundle.links.filter(l=>l.handle===handle);
const link=links.length===1?links[0]:null;
const records=bundle.records.filter(r=>r.taxonKey===link?.taxonKey);
const result=generateListing(records.length===1?records[0]:null,link);
console.log(JSON.stringify(result,null,2));
if(!result.ready) process.exitCode=1;

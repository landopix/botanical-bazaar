import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getPlantZoneGuidance } from '../lib/zoneGuidance.js';
import { validateSignup, registerRestock, deliverRestockEmail, selectionAvailable, cancelRestock } from '../lib/restock.js';
import { restockEmail } from '../lib/restockEmails.js';
import { formatShopifyProduct } from '../lib/shopify.js';

test('Shopify taxonomy references resolve labels and never treat GIDs as zones', () => {
  const base = { id: 'p', title: 'Plant', handle: 'plant', taxonomyHardinessZoneMetafield: {
    type: 'list.metaobject_reference', value: '["gid://shopify/Metaobject/263085817991"]',
    references: { nodes: [{ label: { value: '10b' } }, { label: { value: '11a' } }] },
  } };
  const product = formatShopifyProduct(base);
  assert.deepEqual(product.zones, ['10b', '11a']);
  assert.equal(getPlantZoneGuidance(product, '10a').badgeLabel, 'Seasonal / Protected Culture');
  assert.equal(getPlantZoneGuidance(product, '10b').badgeLabel, 'Good Fit for Outdoors');
  base.taxonomyHardinessZoneMetafield.references = null;
  assert.deepEqual(formatShopifyProduct(base).zones, []);
});

class Store {
  records = new Map();
  version = 0;
  async getWithMetadata(key) { return structuredClone(this.records.get(key) || null); }
  async setJSON(key, data, options = {}) {
    const prior = this.records.get(key);
    if ((options.onlyIfNew && prior) || (options.onlyIfMatch && options.onlyIfMatch !== prior?.etag)) return { modified: false };
    const etag = String(++this.version);
    this.records.set(key, { data: structuredClone(data), etag });
    return { modified: true, etag };
  }
}
const variantId = 'gid://shopify/ProductVariant/1';
const input = { email: 'test@example.com', slug: 'test-plant', variantId, type: 'item_waitlist' };
const plant = { name: 'Test Plant', availableForSale: false, variants: [{ id: variantId, title: '1 Gallon', availableForSale: false, quantityAvailable: 0 }] };

test('zone ranges distinguish half-zones and produce plant-specific care', () => {
  const product = { custom: { hardiness_zone: '9b–11a' } };
  assert.equal(getPlantZoneGuidance(product, '9a').badgeLabel, 'Seasonal / Protected Culture');
  assert.equal(getPlantZoneGuidance(product, '9b').badgeLabel, 'Good Fit for Outdoors');
  assert.equal(getPlantZoneGuidance(product, '10a').badgeLabel, 'Good Fit for Outdoors');
  assert.equal(getPlantZoneGuidance(product, '11b').badgeLabel, 'Outside Listed Range');
  assert.equal(getPlantZoneGuidance({ zones: ['5a-7b'] }, '6a').badgeLabel, 'Good Fit for Outdoors');
  assert.equal(getPlantZoneGuidance({ zones: ['12a-13b'] }, '10a').badgeLabel, 'Seasonal / Protected Culture');
  assert.equal(getPlantZoneGuidance({}, '10a').badgeLabel, 'Hardiness Not Confirmed');
  assert.equal(getPlantZoneGuidance(product, 'garbage').badgeLabel, 'Select Your USDA Zone');
});

test('input validation rejects malformed addresses and slug injection', () => {
  assert.equal(validateSignup({ ...input, email: ' TEST@example.com ' }).email, 'test@example.com');
  for (const email of ['a b@example.com', 'x@example.com\nBcc:y@example.com', '<x>@example.com']) assert.throws(() => validateSignup({ ...input, email }));
  assert.throws(() => validateSignup({ ...input, slug: '../x' }));
  assert.throws(() => validateSignup({ ...input, variantId: 'wrong' }));
});

test('registration is durable, duplicate-safe and rejects wrong or available variants', async () => {
  const store = new Store();
  const record = await registerRestock(store, input, plant);
  assert.equal((await registerRestock(store, input, plant)).cycle, record.cycle);
  await assert.rejects(registerRestock(store, { ...input, variantId: 'gid://shopify/ProductVariant/2' }, plant));
  await assert.rejects(registerRestock(store, input, { ...plant, availableForSale: true, variants: [{ ...plant.variants[0], availableForSale: true, quantityAvailable: 2 }] }));
  await assert.rejects(registerRestock({ getWithMetadata: async () => { throw Error('storage down'); } }, input, plant));
});

test('exact variant availability does not confuse a restocked sibling size', () => {
  const product = { ...plant, availableForSale: true, variants: [...plant.variants, { id: 'gid://shopify/ProductVariant/2', availableForSale: true, quantityAvailable: 5 }] };
  assert.equal(selectionAvailable(product, variantId), false);
  assert.equal(selectionAvailable(product, 'gid://shopify/ProductVariant/2'), true);
  assert.equal(selectionAvailable(null, variantId), false);
});

test('confirmation and restock send once, even with concurrent requests', async () => {
  const store = new Store();
  const record = await registerRestock(store, input, plant);
  const calls = [];
  const send = async (...args) => { calls.push(args); return { data: { id: `email-${calls.length}` } }; };
  await Promise.all([deliverRestockEmail(store, record.id, 'confirmation', send), deliverRestockEmail(store, record.id, 'confirmation', send)]);
  assert.equal(calls.length, 1);
  await deliverRestockEmail(store, record.id, 'restock', send);
  await deliverRestockEmail(store, record.id, 'restock', send);
  assert.equal(calls.length, 2);
  assert.match(calls[1][1].text, /does not reserve/);
  assert.equal((await store.getWithMetadata(`requests/${record.id}`)).data.status, 'notified');
});

test('failed email retries with identical payload and key; old ambiguity requires review', async () => {
  const store = new Store();
  const record = await registerRestock(store, input, plant);
  const calls = [];
  const now = Date.now();
  const fail = async (...args) => { calls.push(args); throw Error('timeout'); };
  await assert.rejects(deliverRestockEmail(store, record.id, 'confirmation', fail, now));
  await deliverRestockEmail(store, record.id, 'confirmation', fail, now + 1000);
  assert.equal(calls.length, 1);
  await assert.rejects(deliverRestockEmail(store, record.id, 'confirmation', fail, now + 121000));
  assert.deepEqual(calls[0], calls[1]);
  await deliverRestockEmail(store, record.id, 'confirmation', fail, now + 24 * 3600000);
  assert.equal(calls.length, 2);
  assert.equal((await store.getWithMetadata(`requests/${record.id}`)).data.confirmation.needsReview, true);
});

test('cancellation blocks delivery and a new signup gets a new cycle and token', async () => {
  const store = new Store();
  const record = await registerRestock(store, input, plant);
  assert.equal(await cancelRestock(store, record.id, 'a'.repeat(64)), false);
  assert.equal(await cancelRestock(store, record.id, record.token), true);
  assert.equal(await deliverRestockEmail(store, record.id, 'restock', () => { throw Error('must not send'); }), false);
  const newRecord = await registerRestock(store, input, plant);
  assert.notEqual(newRecord.cycle, record.cycle);
  assert.notEqual(newRecord.token, record.token);
});

test('email includes escaped names, exact selection link, and cancellation link', () => {
  const email = restockEmail({ ...input, id: 'a'.repeat(64), token: 'b'.repeat(64), name: '<Plant>', variantTitle: '1 Gallon' }, 'confirmation');
  assert.ok(!email.html.includes('<Plant>'));
  assert.match(email.html, /&lt;Plant&gt;/);
  assert.match(email.text, /variant=gid%3A/);
  assert.match(email.text, /api\/restock-unsubscribe/);
});

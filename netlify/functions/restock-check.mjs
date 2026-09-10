import { restockRuntime } from '../../lib/restockRuntime.js';
import { deliverRestockEmail, selectionAvailable } from '../../lib/restock.js';
import { getProductByHandle } from '../../lib/shopify.js';

export default async () => {
  const { store, send } = restockRuntime();
  const started = Date.now();
  const products = new Map();
  let processed = 0;
  const cursor = await store.get('worker-cursor', { type: 'json' });
  let lastKey = '';
  let completed = true;
  const keys = [];
  for await (const page of store.list({ prefix: 'requests/', paginate: true })) {
    keys.push(...page.blobs.map(blob => blob.key));
  }
  for (const key of keys.sort()) {
      if (cursor?.key && key <= cursor.key) continue;
      if (Date.now() - started > 20000 || processed >= 20) { completed = false; break; }
      lastKey = key;
      const record = await store.get(key, { type: 'json' });
      if (!record || record.status !== 'waiting') continue;
      processed++;
      try {
        if (!record.confirmation?.sentAt) await deliverRestockEmail(store, record.id, 'confirmation', send);
        if (record.type !== 'item_waitlist') {
          await deliverRestockEmail(store, record.id, 'nurseryOwner', send);
          continue;
        }
        const fresh = await store.get(key, { type: 'json' });
        if (!fresh?.confirmation?.sentAt) continue;
        if (!products.has(record.slug)) products.set(record.slug, await getProductByHandle(record.slug));
        if (selectionAvailable(products.get(record.slug), record.variantId)) {
          await deliverRestockEmail(store, record.id, 'restock', send);
        }
      } catch { console.error('Restock request will retry', record.id); }
  }
  await store.setJSON('worker-cursor', { key: completed ? '' : lastKey });
  return new Response(JSON.stringify({ processed }), { status: 200 });
};

export const config = { schedule: '*/15 * * * *' };

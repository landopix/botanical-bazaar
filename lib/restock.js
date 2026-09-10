import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { restockEmail } from './restockEmails.js';

export function validateSignup(body = {}) {
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const slug = typeof body.slug === 'string' ? body.slug.trim() : '';
  if (email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) throw new Error('A valid email address is required.');
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) throw new Error('A valid plant is required.');
  const variantId = body.variantId || '';
  if (typeof variantId !== 'string' || (variantId && !/^gid:\/\/shopify\/ProductVariant\/\d+$/.test(variantId))) throw new Error('A valid plant size is required.');
  const type = body.type === 'nursery_update_waitlist' && slug === 'nursery-update' ? 'nursery_update_waitlist' : 'item_waitlist';
  return { email, slug, variantId, type };
}

export function selectionAvailable(product, variantId) {
  if (!product || product.availableForSale !== true) return false;
  const available = v => v.availableForSale === true && (v.quantityAvailable == null || v.quantityAvailable > 0);
  if (variantId) return (product.variants || []).some(v => v.id === variantId && available(v));
  return (product.variants || []).some(available);
}

export async function registerRestock(store, input, product) {
  if (input.type === 'item_waitlist') {
    if (!product) throw new Error('This plant is no longer listed.');
    if (input.variantId && !(product.variants || []).some(v => v.id === input.variantId)) throw new Error('This size is no longer listed.');
    if (selectionAvailable(product, input.variantId)) throw new Error('This selection is already available. Refresh the page to order.');
  }
  const id = createHash('sha256').update(`${input.email}\n${input.slug}\n${input.variantId}`).digest('hex');
  const key = `requests/${id}`;
  const existing = await store.getWithMetadata(key, { type: 'json' });
  if (existing && existing.data.status === 'waiting') return existing.data;
  const record = {
    ...input, id, token: randomBytes(32).toString('hex'), cycle: randomUUID(), status: 'waiting',
    name: product?.name || 'Nursery Releases',
    variantTitle: product?.variants?.find(v => v.id === input.variantId)?.title || '',
    createdAt: new Date().toISOString(),
  };
  if (record.variantTitle === 'Default Title') record.variantTitle = '';
  const result = await store.setJSON(key, record, existing ? { onlyIfMatch: existing.etag } : { onlyIfNew: true });
  if (!result.modified) throw new Error('Your request is being updated. Please try again.');
  return record;
}

// Persist the exact message before sending. CAS prevents competing requests from
// sending concurrently; Resend's key covers retry after an interrupted response.
export async function deliverRestockEmail(store, id, phase, send, now = Date.now()) {
  const key = `requests/${id}`;
  const snapshot = await store.getWithMetadata(key, { type: 'json' });
  if (!snapshot || snapshot.data.status !== 'waiting') return false;
  const record = snapshot.data;
  const delivery = record[phase];
  if (delivery?.sentAt || delivery?.leaseUntil > now || delivery?.needsReview) return false;
  // Never resend an ambiguous message beyond the provider's 24-hour dedup window.
  if (delivery?.firstAttempt && now - delivery.firstAttempt > 23 * 60 * 60 * 1000) {
    await store.setJSON(key, { ...record, [phase]: { ...delivery, needsReview: true } }, { onlyIfMatch: snapshot.etag });
    console.error('Restock delivery needs review', id, phase);
    return false;
  }
  const pending = { ...delivery, firstAttempt: delivery?.firstAttempt || now, leaseUntil: now + 120000,
    message: delivery?.message || restockEmail(record, phase) };
  const claim = await store.setJSON(key, { ...record, [phase]: pending }, { onlyIfMatch: snapshot.etag });
  if (!claim.modified) return false;
  const result = await send(phase === 'nurseryOwner' ? 'info@thebotanicalbazaar.com' : record.email, pending.message, `restock/${record.cycle}/${phase}`);
  if (result.error || !result.data?.id) throw new Error('Email provider did not accept the message.');
  const fresh = await store.getWithMetadata(key, { type: 'json' });
  if (!fresh || fresh.data.cycle !== record.cycle) return false;
  const updated = { ...fresh.data, [phase]: { ...pending, leaseUntil: 0, sentAt: new Date(now).toISOString(), emailId: result.data.id } };
  if (phase === 'restock' && updated.status === 'waiting') updated.status = 'notified';
  const saved = await store.setJSON(key, updated, { onlyIfMatch: fresh.etag });
  if (!saved.modified) throw new Error('Delivery accepted; receipt needs reconciliation.');
  return true;
}

export async function cancelRestock(store, id, token) {
  if (!/^[a-f0-9]{64}$/.test(id || '') || !/^[a-f0-9]{64}$/.test(token || '')) return false;
  const key = `requests/${id}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const record = await store.getWithMetadata(key, { type: 'json' });
    if (!record || record.data.token !== token) return false;
    const saved = await store.setJSON(key, { ...record.data, status: 'cancelled' }, { onlyIfMatch: record.etag });
    if (saved.modified) return true;
  }
  throw new Error('Please try cancelling again.');
}

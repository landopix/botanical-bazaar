import { getProductByHandle } from '../../lib/shopify.js';
import { validateSignup, registerRestock, deliverRestockEmail } from '../../lib/restock.js';
import { restockRuntime } from '../../lib/restockRuntime.js';

export default async function notifyMeHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
  let input;
  try { input = validateSignup(req.body); }
  catch (error) { return res.status(400).json({ error: error.message }); }
  try {
    const { store, send } = restockRuntime();
    const product = input.type === 'item_waitlist' ? await getProductByHandle(input.slug) : null;
    const record = await registerRestock(store, input, product);
    let confirmationSent = Boolean(record.confirmation?.sentAt);
    try { confirmationSent = await deliverRestockEmail(store, record.id, 'confirmation', send) || confirmationSent; }
    catch { console.error('Waitlist confirmation queued for retry', record.id); }
    if (input.type === 'nursery_update_waitlist') {
      try { await deliverRestockEmail(store, record.id, 'nurseryOwner', send); }
      catch { console.error('Nursery owner notification queued for retry', record.id); }
      return res.status(200).json({ success: true, message: 'Your nursery update request is saved.' });
    }
    return res.status(200).json({ success: true, message: confirmationSent
      ? 'Your request is saved. Check your inbox for confirmation; we’ll email you when this selection is available.'
      : 'Your request is saved. Your confirmation email is queued; we’ll email you when this selection is available.' });
  } catch (error) {
    console.error('Waitlist registration failed', error.name);
    return res.status(503).json({ error: 'We couldn’t save your request. Please try again shortly, or contact info@thebotanicalbazaar.com.' });
  }
}

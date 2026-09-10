import { cancelRestock } from '../../lib/restock.js';
import { restockRuntime } from '../../lib/restockRuntime.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Referrer-Policy', 'no-referrer');
  const { id, token } = req.method === 'POST' ? req.body || {} : req.query;
  if (!/^[a-f0-9]{64}$/.test(id || '') || !/^[a-f0-9]{64}$/.test(token || '')) return res.status(400).send('Invalid cancellation link.');
  // GET only presents a form, so mail scanners cannot cancel an alert.
  if (req.method === 'GET') return res.status(200).send(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width"><title>Cancel plant alert</title><body style="background:#00301E;color:#F5E7C4;font:20px Georgia;padding:40px"><h1>Cancel this plant alert?</h1><form method="post"><input type="hidden" name="id" value="${id}"><input type="hidden" name="token" value="${token}"><button style="padding:12px">Cancel my alert</button></form></body></html>`);
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return res.status(405).end(); }
  try {
    const { store } = restockRuntime();
    const cancelled = await cancelRestock(store, id, token);
    return res.status(cancelled ? 200 : 400).send(cancelled ? 'Your plant alert has been cancelled.' : 'Invalid cancellation link.');
  } catch { return res.status(503).send('Could not cancel the alert. Please try again.'); }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  const { order, email } = req.body || {};

  const cleanOrder = typeof order === 'string' ? order.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim() : '';

  if (!cleanOrder) {
    return res.status(400).json({ error: 'Order Number is required.' });
  }

  if (!cleanEmail || !cleanEmail.includes('@')) {
    return res.status(400).json({ error: 'A valid Email Address is required.' });
  }

  const lookupEndpoint = 'https://thebotanicalbazaar.com/apps/order-lookup';

  return res.status(200).json({
    success: true,
    targetUrl: lookupEndpoint,
    order: cleanOrder,
    email: cleanEmail
  });
}

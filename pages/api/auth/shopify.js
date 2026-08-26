import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use GET.' });
  }

  const rawDomain = req.query.shop || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'the-botanical-bazaar.myshopify.com';
  const shop = String(rawDomain).replace(/^https?:\/\//i, '').replace(/\/+$/, '');

  const clientId = process.env.SHOPIFY_CLIENT_ID || '088b6c196d7fc15160629804844d369c';
  const scopes = 'write_customers,read_customers';

  const protocol = req.headers['x-forwarded-proto'] || (req.headers.host?.includes('localhost') ? 'http' : 'https');
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/api/auth/shopify/callback`;

  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `shopify_oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`);

  const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return res.redirect(redirectUrl);
}

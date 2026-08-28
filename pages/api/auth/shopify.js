import crypto from 'crypto';

function sanitizeShopDomain(str) {
  if (typeof str !== 'string') return 'shop.thebotanicalbazaar.com';
  let domain = str.trim();
  if (domain.startsWith('https://')) domain = domain.slice(8);
  if (domain.startsWith('http://')) domain = domain.slice(7);
  while (domain.endsWith('/')) {
    domain = domain.slice(0, -1);
  }
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]*\.(?:myshopify\.com|thebotanicalbazaar\.com)$/.test(domain)) {
    return 'shop.thebotanicalbazaar.com';
  }
  return domain;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use GET.' });
  }

  const shop = sanitizeShopDomain(req.query.shop || process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN);
  const clientId = process.env.SHOPIFY_CLIENT_ID || '088b6c196d7fc15160629804844d369c';
  const scopes = 'write_customers,read_customers';

  const protocol = req.headers['x-forwarded-proto'] || (req.headers.host?.includes('localhost') ? 'http' : 'https');
  const host = req.headers.host;
  const redirectUri = `${protocol}://${host}/api/auth/shopify/callback`;

  const state = crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', `shopify_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`);

  const redirectUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

  return res.redirect(redirectUrl);
}

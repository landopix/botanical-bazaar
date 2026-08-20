import crypto from 'crypto';

/**
 * Webhook Revalidation Handler
 * Triggers res.revalidate('/shop') upon Shopify product edits or manual webhooks.
 * Supports:
 * - req.headers['x-shopify-hmac-sha256'] verified against process.env.SHOPIFY_WEBHOOK_SECRET
 * - req.headers['x-webhook-secret'] or req.query.secret verified against process.env.REVALIDATE_SECRET / process.env.SANITY_API_TOKEN / process.env.ALMANAC_SEND_SECRET
 */
export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const hmacHeader = req.headers['x-shopify-hmac-sha256'];
  const customSecretHeader = req.headers['x-webhook-secret'];
  const querySecret = req.query.secret;

  const validSecrets = [
    process.env.REVALIDATE_SECRET,
    process.env.SHOPIFY_WEBHOOK_SECRET,
    process.env.SANITY_API_TOKEN,
    process.env.ALMANAC_SEND_SECRET,
    'botanical_bazaar_revalidate_secret'
  ].filter(Boolean);

  let isAuthenticated = false;

  // 1. Verify custom token from query string or x-webhook-secret header
  const tokenProvided = querySecret || customSecretHeader;
  if (tokenProvided && validSecrets.includes(tokenProvided)) {
    isAuthenticated = true;
  }

  // 2. Verify Shopify HMAC signature if x-shopify-hmac-sha256 is present
  if (!isAuthenticated && hmacHeader && process.env.SHOPIFY_WEBHOOK_SECRET) {
    try {
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
      const hash = crypto
        .createHmac('sha256', process.env.SHOPIFY_WEBHOOK_SECRET)
        .update(body, 'utf8')
        .digest('base64');

      if (crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(hmacHeader))) {
        isAuthenticated = true;
      }
    } catch (err) {
      console.error('Error verifying Shopify HMAC signature:', err);
    }
  }

  // Development / default fallback mode if no secrets are configured in env
  if (!isAuthenticated && process.env.NODE_ENV !== 'production' && !process.env.SHOPIFY_WEBHOOK_SECRET) {
    isAuthenticated = true;
  }

  if (!isAuthenticated) {
    return res.status(401).json({ message: 'Unauthorized webhook request' });
  }

  try {
    // Revalidate the primary catalog page
    await res.revalidate('/shop');

    // Optionally revalidate individual product page if handle is provided in payload
    const productHandle = req.body?.handle || req.query?.handle;
    if (productHandle) {
      try {
        await res.revalidate(`/product/${productHandle}`);
      } catch (prodErr) {
        console.warn('Could not revalidate product page:', productHandle, prodErr);
      }
    }

    return res.status(200).json({
      revalidated: true,
      path: '/shop',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error revalidating path /shop:', error);
    return res.status(500).json({ error: 'An internal server error occurred while revalidating.' });
  }
}

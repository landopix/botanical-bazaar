import crypto from 'crypto';

function verifyShopifyHmac(query, clientSecret) {
  if (!clientSecret || !query || !query.hmac) return true; // fallback if secret not yet provided in dev

  const { hmac, signature, ...params } = query;
  const message = Object.keys(params)
    .sort()
    .map(key => `${key}=${Array.isArray(params[key]) ? params[key].join(',') : params[key]}`)
    .join('&');

  const generatedHmac = crypto
    .createHmac('sha256', clientSecret)
    .update(message)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(generatedHmac, 'utf8'),
      Buffer.from(String(hmac), 'utf8')
    );
  } catch (e) {
    return false;
  }
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use GET.' });
  }

  const { code, hmac, shop, state } = req.query;

  if (!code || !shop) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Shopify OAuth Error</title></head>
        <body style="font-family: sans-serif; background: #00301E; color: #F5E7C4; padding: 40px;">
          <h2>Shopify OAuth Authorization Failed</h2>
          <p style="color: #ff8888;">Missing mandatory parameter: <code>code</code> or <code>shop</code> in callback query.</p>
        </body>
      </html>
    `);
  }

  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
  const clientId = process.env.SHOPIFY_CLIENT_ID || '088b6c196d7fc15160629804844d369c';

  if (clientSecret && !verifyShopifyHmac(req.query, clientSecret)) {
    return res.status(400).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Shopify OAuth Error</title></head>
        <body style="font-family: sans-serif; background: #00301E; color: #F5E7C4; padding: 40px;">
          <h2>Shopify OAuth Validation Error</h2>
          <p style="color: #ff8888;">HMAC signature verification failed. Please check your SHOPIFY_CLIENT_SECRET.</p>
        </body>
      </html>
    `);
  }

  try {
    const cleanShop = String(shop).replace(/^https?:\/\//i, '').replace(/\/+$/, '');
    const tokenUrl = `https://${cleanShop}/admin/oauth/access_token`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret || '',
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('Shopify Token Exchange Error:', tokenData);
      const errorMsg = tokenData.error_description || tokenData.error || 'Failed to exchange authorization code for access token.';
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Shopify OAuth Token Error</title></head>
          <body style="font-family: sans-serif; background: #00301E; color: #F5E7C4; padding: 40px;">
            <h2 style="color: #D4B06A;">Token Exchange Failed</h2>
            <p style="color: #ff8888;">${escapeHtml(errorMsg)}</p>
            <p>Ensure <code>SHOPIFY_CLIENT_SECRET</code> is correctly configured in your <code>.env</code> file.</p>
          </body>
        </html>
      `);
    }

    const accessToken = tokenData.access_token;
    const grantedScope = tokenData.scope || 'write_customers,read_customers';
    const safeAccessToken = escapeHtml(accessToken);
    const safeShop = escapeHtml(cleanShop);
    const safeScope = escapeHtml(grantedScope);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Shopify OAuth Token Success - The Botanical Bazaar</title>
          <style>
            body {
              font-family: 'Helvetica Neue', Arial, sans-serif;
              background-color: #00301E;
              color: #F5E7C4;
              padding: 40px 20px;
              margin: 0;
            }
            .container {
              max-width: 680px;
              margin: 0 auto;
              background: #002517;
              border: 1px solid #D4B06A;
              border-radius: 12px;
              padding: 32px;
              box-shadow: 0 8px 24px rgba(0,0,0,0.3);
            }
            h1 {
              color: #D4B06A;
              margin-top: 0;
              font-family: Georgia, serif;
              font-size: 26px;
            }
            .badge {
              display: inline-block;
              background: #D4B06A;
              color: #00301E;
              padding: 4px 12px;
              border-radius: 16px;
              font-weight: bold;
              font-size: 13px;
              margin-bottom: 20px;
            }
            .token-box {
              background: #001A10;
              border: 1px solid rgba(212, 176, 106, 0.4);
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
              word-break: break-all;
              font-family: monospace;
              font-size: 15px;
              color: #A3E635;
            }
            .instructions {
              background: rgba(212, 176, 106, 0.1);
              border-left: 4px solid #D4B06A;
              padding: 16px;
              border-radius: 4px;
              margin-top: 24px;
              font-size: 14px;
              line-height: 1.6;
            }
            code {
              background: rgba(0,0,0,0.4);
              padding: 2px 6px;
              border-radius: 4px;
              color: #F5E7C4;
            }
            button {
              background-color: #D4B06A;
              color: #00301E;
              border: none;
              padding: 10px 20px;
              border-radius: 6px;
              font-weight: bold;
              cursor: pointer;
              margin-top: 8px;
            }
            button:hover {
              background-color: #E9DCBE;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <span class="badge">OAuth Success</span>
            <h1>Shopify Admin Access Token Generated</h1>
            <p>Your Next.js OAuth authorization code exchange completed successfully for shop <strong>${safeShop}</strong>.</p>

            <label style="font-size: 14px; color: #D4B06A; font-weight: bold;">Your Shopify Admin Access Token:</label>
            <div class="token-box" id="tokenValue">${safeAccessToken}</div>
            <button onclick="navigator.clipboard.writeText(document.getElementById('tokenValue').innerText).then(() => alert('Token copied to clipboard!'))">
              Copy Token to Clipboard
            </button>

            <div class="instructions">
              <strong>Next Steps:</strong>
              <ol style="margin: 8px 0 0 20px; padding: 0;">
                <li>Copy the token above.</li>
                <li>Add it to your environment variables file (<code>.env</code> or <code>.env.local</code>):<br />
                    <code>SHOPIFY_ADMIN_ACCESS_TOKEN=${safeAccessToken}</code>
                </li>
                <li>Restart your Next.js server to enable automated customer & newsletter sync.</li>
              </ol>
              <p style="margin-top: 12px; margin-bottom: 0;"><strong>Granted Scopes:</strong> <code>${safeScope}</code></p>
            </div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Error in Shopify OAuth callback:', err);
    return res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head><title>Shopify OAuth Server Error</title></head>
        <body style="font-family: sans-serif; background: #00301E; color: #F5E7C4; padding: 40px;">
          <h2>Internal Server Error</h2>
          <p style="color: #ff8888;">An error occurred during Shopify OAuth authentication processing.</p>
        </body>
      </html>
    `);
  }
}

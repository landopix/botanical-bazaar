import { getAllProducts } from '../../../lib/shopify.js';
import { mapCatalogToGoogleMerchantItems, syncToGoogleMerchantContentApi } from '../../../lib/google-merchant.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use GET or POST.' });
  }

  const syncSecret = process.env.MERCHANT_SYNC_SECRET || process.env.CRON_SECRET;

  if (syncSecret) {
    const authHeader = req.headers.authorization || '';
    const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, '').trim();
    const tokenFromCustomHeader = req.headers['x-sync-secret'] || '';
    const tokenFromQuery = req.query?.secret || '';

    const providedSecret = tokenFromHeader || tokenFromCustomHeader || tokenFromQuery;

    if (providedSecret !== syncSecret) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or missing sync secret.' });
    }
  }

  const correlationId = `gmc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  try {
    const products = await getAllProducts();
    const merchantItems = mapCatalogToGoogleMerchantItems(products, {
      dataSourceId: process.env.GOOGLE_DATA_SOURCE_ID || '10714664344',
      defaultBrand: 'The Botanical Bazaar'
    });

    const isDirectPushRequested = req.method === 'POST' || req.query?.push === 'true';
    let syncResult = null;

    if (isDirectPushRequested && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      syncResult = await syncToGoogleMerchantContentApi({
        items: merchantItems,
        merchantId: process.env.GOOGLE_MERCHANT_ID || '5843329915',
        dataSourceId: process.env.GOOGLE_DATA_SOURCE_ID || '10714664344'
      });
    }

    const responseData = {
      success: true,
      correlationId,
      merchantId: process.env.GOOGLE_MERCHANT_ID || '5843329915',
      dataSourceName: process.env.GOOGLE_DATA_SOURCE_NAME || 'Botanical Bazaar Live Catalog',
      dataSourceId: process.env.GOOGLE_DATA_SOURCE_ID || '10714664344',
      totalProducts: products.length,
      totalItemsMapped: merchantItems.length,
      pushedToGoogle: Boolean(syncResult?.pushedToGoogle),
      syncDetails: syncResult || {
        status: 'Formatted payload generated successfully.',
        note: 'Provide GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY to enable direct Content API push.'
      },
      items: merchantItems
    };

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.status(200).json(responseData);
  } catch (error) {
    console.error(`[Google Merchant Sync Error ${correlationId}]:`, error);
    return res.status(500).json({
      error: 'An internal server error occurred while syncing with Google Merchant Center.',
      correlationId
    });
  }
}

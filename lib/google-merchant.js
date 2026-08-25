import crypto from 'crypto';

/**
 * Extracts numeric ID or clean string from a Shopify GraphQL GID.
 * e.g. "gid://shopify/Product/8751426961543" -> "8751426961543"
 */
export function extractNumericId(gid) {
  if (!gid) return '';
  const str = String(gid);
  const parts = str.split('/');
  return parts[parts.length - 1] || str;
}

/**
 * Strips HTML tags and normalizes whitespace for Google Merchant product descriptions.
 */
export function sanitizeDescription(htmlOrText) {
  if (!htmlOrText) return 'Botanical plant selection from The Botanical Bazaar.';
  const clean = String(htmlOrText)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.length > 5000 ? clean.substring(0, 4997) + '...' : clean;
}

/**
 * Maps a single formatted Shopify product into one or more Google Content API product objects
 * (one object per product variant).
 */
export function mapShopifyProductToGoogleMerchantItems(product, options = {}) {
  if (!product) return [];

  const defaultBrand = options.defaultBrand || 'The Botanical Bazaar';
  const baseUrl = options.baseUrl || 'https://thebotanicalbazaar.com';
  const dataSourceId = options.dataSourceId || process.env.GOOGLE_DATA_SOURCE_ID || '10714664344';

  const cleanProductId = extractNumericId(product.id);
  const productLink = `${baseUrl.replace(/\/+$/, '')}/product/${product.slug}`;
  const description = sanitizeDescription(product.description || product.descriptionHtml);
  const brand = product.vendor && product.vendor.trim() ? product.vendor.trim() : defaultBrand;

  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : [{
        id: product.id,
        title: 'Default Title',
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice || null,
        availableForSale: product.availableForSale ?? true,
        quantityAvailable: product.quantity ?? 1,
        sku: product.sku || ''
      }];

  const hasMultipleVariants = variants.length > 1;

  return variants.map((variant) => {
    const cleanVariantId = extractNumericId(variant.id);
    const offerId = `shopify_US_${cleanProductId}_${cleanVariantId}`;
    const variantTitle = variant.title && variant.title !== 'Default Title'
      ? `${product.name} - ${variant.title}`
      : product.name;

    const mainImage = variant.image || product.image || `${baseUrl}/assets/placeholder.png`;
    const additionalImages = (product.images || []).filter(img => img !== mainImage);

    const priceNum = typeof variant.price === 'number' ? variant.price : parseFloat(variant.price || 0);
    const compareNum = typeof variant.compareAtPrice === 'number' ? variant.compareAtPrice : parseFloat(variant.compareAtPrice || 0);

    let priceObj = { value: priceNum.toFixed(2), currency: 'USD' };
    let salePriceObj = null;

    if (compareNum > priceNum) {
      priceObj = { value: compareNum.toFixed(2), currency: 'USD' };
      salePriceObj = { value: priceNum.toFixed(2), currency: 'USD' };
    }

    const isAvailable = Boolean(
      variant.availableForSale && (variant.quantityAvailable > 0 || product.quantity > 0)
    );

    const item = {
      offerId,
      id: `online:en:US:${offerId}`,
      title: variantTitle,
      description,
      link: productLink,
      imageLink: mainImage,
      additionalImageLinks: additionalImages.slice(0, 10),
      contentLanguage: 'en',
      targetCountry: 'US',
      channel: 'online',
      availability: isAvailable ? 'in_stock' : 'out_of_stock',
      price: priceObj,
      brand,
      identifierExists: false,
      mpn: variant.sku || product.sku || offerId,
      condition: 'new',
      googleProductCategory: 'Home & Garden > Plants',
      feedId: dataSourceId
    };

    if (salePriceObj) {
      item.salePrice = salePriceObj;
    }

    if (hasMultipleVariants) {
      item.itemGroupId = `shopify_US_${cleanProductId}`;
    }

    return item;
  });
}

/**
 * Maps an array of formatted Shopify products into a flat array of Google Merchant Content API items.
 */
export function mapCatalogToGoogleMerchantItems(products, options = {}) {
  if (!Array.isArray(products)) return [];
  return products.flatMap(p => mapShopifyProductToGoogleMerchantItems(p, options));
}

/**
 * Encodes a string or object to Base64URL.
 */
function base64UrlEncode(data) {
  const buf = typeof data === 'string' ? Buffer.from(data) : Buffer.from(JSON.stringify(data));
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Obtains an OAuth2 access token for Google Content API using Service Account private key.
 */
export async function getGoogleAccessToken({ clientEmail, privateKey }) {
  if (!clientEmail || !privateKey) {
    throw new Error('Google Service Account email and private key are required for API authentication.');
  }

  const cleanPrivateKey = privateKey.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/content',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(unsignedToken);
  const signature = signer.sign(cleanPrivateKey, 'base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  const jwt = `${unsignedToken}.${signature}`;

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const data = await response.json();
  if (data.error) {
    throw new Error(`Google OAuth error: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * Batches and pushes Google Content API product items to Google Merchant Center.
 */
export async function syncToGoogleMerchantContentApi({
  items,
  merchantId = process.env.GOOGLE_MERCHANT_ID || '5843329915',
  dataSourceId = process.env.GOOGLE_DATA_SOURCE_ID || '10714664344',
  clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  privateKey = process.env.GOOGLE_PRIVATE_KEY
}) {
  if (!items || items.length === 0) {
    return { success: true, count: 0, message: 'No items to sync.' };
  }

  if (!clientEmail || !privateKey) {
    return {
      success: false,
      count: items.length,
      skipped: true,
      reason: 'Google Service Account credentials (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY) not provided. Returning mapped payload.'
    };
  }

  const accessToken = await getGoogleAccessToken({ clientEmail, privateKey });
  const batchUrl = `https://shoppingcontent.googleapis.com/content/v2.1/${merchantId}/products/custombatch`;

  const BATCH_SIZE = 100;
  const results = [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const chunk = items.slice(i, i + BATCH_SIZE);
    const entries = chunk.map((productItem, index) => ({
      batchId: i + index + 1,
      merchantId,
      method: 'insert',
      feedId: dataSourceId,
      product: productItem
    }));

    const response = await fetch(batchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({ entries })
    });

    const resData = await response.json();
    results.push(resData);
  }

  return {
    success: true,
    count: items.length,
    pushedToGoogle: true,
    batchResponses: results
  };
}

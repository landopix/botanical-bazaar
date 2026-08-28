import { getAllProducts, createShopifyCart } from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const correlationId = 'chk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  try {
    const {
      cart,
      items,
      lineItems,
      customer_email,
      customer_name,
      customer_phone,
      user_hardiness_zone,
      userHardinessZone,
      notes,
      customAttributes: bodyCustomAttributes
    } = req.body;

    const cartItems = cart || items || lineItems;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty', correlationId });
    }

    const zone = user_hardiness_zone || userHardinessZone || '10a';

    let catalog = [];
    try {
      catalog = await getAllProducts();
    } catch (e) {
      console.warn(`[${correlationId}] Could not fetch products catalog during checkout setup:`, e);
    }

    // Helper to format/ensure GID format
    const formatVariantGid = (id) => {
      if (!id) return null;
      const strId = String(id).trim();
      if (strId.startsWith('gid://shopify/ProductVariant/')) return strId;
      if (/^\d+$/.test(strId)) return `gid://shopify/ProductVariant/${strId}`;
      return null;
    };

    // Resolve merchandise variant GIDs for all line items
    const lines = cartItems.map(item => {
      let rawVariantId = item.variantId || item.id || item.merchandiseId;
      let merchandiseId = formatVariantGid(rawVariantId);

      // If merchandiseId is not a valid variant GID, resolve from catalog product
      if (!merchandiseId) {
        const productDef = catalog.find(p => p.slug === item.slug || p.id === item.id);
        if (productDef && productDef.variants && productDef.variants.length > 0) {
          // If a selectedSize is provided, try to match variant title or pot size
          if (item.selectedSize) {
            const matchedVariant = productDef.variants.find(
              v => v.title && v.title.toLowerCase() === item.selectedSize.toLowerCase()
            );
            if (matchedVariant) {
              merchandiseId = formatVariantGid(matchedVariant.id);
            }
          }
          if (!merchandiseId) {
            merchandiseId = formatVariantGid(productDef.variants[0].id);
          }
        }
      }

      if (!merchandiseId) {
        throw new Error(`Missing valid Shopify merchandise variant ID for item: ${item.name || item.slug || item.id}`);
      }

      // Extract custom attributes or item size
      let itemAttributes = [];
      if (Array.isArray(item.customAttributes)) {
        itemAttributes = item.customAttributes;
      } else if (item.selectedSize) {
        itemAttributes = [{ key: 'Size', value: item.selectedSize }];
      }

      return {
        merchandiseId,
        quantity: item.quantity || 1,
        attributes: itemAttributes
      };
    });

    // Custom order attributes for notes, hardiness zone, contact info
    const customAttributes = [
      { key: 'USDA Hardiness Zone', value: zone }
    ];

    if (Array.isArray(bodyCustomAttributes)) {
      bodyCustomAttributes.forEach(attr => {
        if (attr && attr.key && attr.value && attr.key !== 'USDA Hardiness Zone') {
          customAttributes.push(attr);
        }
      });
    }

    if (customer_name) {
      customAttributes.push({ key: 'Customer Name', value: customer_name });
    }
    if (customer_phone) {
      customAttributes.push({ key: 'Customer Phone', value: customer_phone });
    }
    if (notes) {
      customAttributes.push({ key: 'Order Notes', value: notes });
    }

    const buyerIdentity = customer_email ? { email: customer_email } : null;

    const { checkoutUrl, cartId } = await createShopifyCart({
      lines,
      ...(buyerIdentity ? { buyerIdentity } : {}),
      customAttributes
    });

    return res.status(200).json({
      url: checkoutUrl,
      webUrl: checkoutUrl,
      checkoutId: cartId,
      cartId,
      correlationId
    });
  } catch (error) {
    console.error(`[${correlationId}] API Checkout Error:`, error);
    return res.status(500).json({ error: 'An internal server error occurred.', correlationId });
  }
}

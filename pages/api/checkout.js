import { getAllProducts, createShopifyCart } from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      cart,
      fulfillment_method,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      pickup_date,
      notes,
      user_hardiness_zone
    } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let catalog = [];
    try {
      catalog = await getAllProducts();
    } catch (e) {
      console.warn('Could not fetch products catalog during checkout setup:', e);
    }

    // Resolve merchandise variant GIDs for all line items
    const lines = cart.map(item => {
      let merchandiseId = item.variantId || item.id;

      // If merchandiseId is not a valid variant GID, resolve from catalog product
      if (!merchandiseId || !merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
        const productDef = catalog.find(p => p.slug === item.slug || p.id === item.id);
        if (productDef && productDef.variants && productDef.variants.length > 0) {
          // If a selectedSize is provided, try to match variant title or pot size
          if (item.selectedSize) {
            const matchedVariant = productDef.variants.find(
              v => v.title.toLowerCase() === item.selectedSize.toLowerCase()
            );
            if (matchedVariant) {
              merchandiseId = matchedVariant.id;
            }
          }
          if (!merchandiseId || !merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
            merchandiseId = productDef.variants[0].id;
          }
        }
      }

      if (!merchandiseId || !merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
        throw new Error(`Missing valid Shopify merchandise variant ID for item: ${item.name || item.slug}`);
      }

      return {
        merchandiseId,
        quantity: item.quantity || 1,
        attributes: item.selectedSize ? [{ key: 'Size', value: item.selectedSize }] : []
      };
    });

    // Custom order attributes for fulfillment, notes, hardiness zone, contact info
    const customAttributes = [
      { key: 'Fulfillment Method', value: fulfillment_method || 'shipping' },
      { key: 'Customer Name', value: customer_name || '' },
      { key: 'Customer Phone', value: customer_phone || '' },
      { key: 'USDA Hardiness Zone', value: user_hardiness_zone || '10a' }
    ];

    if (pickup_date) {
      customAttributes.push({ key: 'Pickup Date', value: pickup_date });
    }
    if (notes) {
      customAttributes.push({ key: 'Order Notes', value: notes });
    }
    if (shipping_address) {
      customAttributes.push({
        key: 'Shipping Details',
        value: typeof shipping_address === 'object' ? JSON.stringify(shipping_address) : String(shipping_address)
      });
    }

    const buyerIdentity = customer_email ? { email: customer_email } : null;

    const { checkoutUrl } = await createShopifyCart({
      lines,
      buyerIdentity,
      customAttributes
    });

    return res.status(200).json({ url: checkoutUrl });
  } catch (error) {
    console.error('API Checkout Error:', error);
    return res.status(500).json({ error: error.message || 'An internal server error occurred.' });
  }
}

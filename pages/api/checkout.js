import { getAllProducts, createShopifyCart } from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      cart,
      items,
      fulfillment_method,
      fulfillmentMethod,
      customer_email,
      customer_name,
      customer_phone,
      user_hardiness_zone,
      userHardinessZone,
      notes
    } = req.body;

    const cartItems = cart || items;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const selectedFulfillment = fulfillment_method || fulfillmentMethod || 'shipping';
    const deliveryMethod = selectedFulfillment === 'pickup' ? 'PICK_UP' : 'SHIPPING';
    const zone = user_hardiness_zone || userHardinessZone || '10a';

    let catalog = [];
    try {
      catalog = await getAllProducts();
    } catch (e) {
      console.warn('Could not fetch products catalog during checkout setup:', e);
    }

    // Resolve merchandise variant GIDs for all line items
    const lines = cartItems.map(item => {
      let merchandiseId = item.variantId || item.id;

      // If merchandiseId is not a valid variant GID, resolve from catalog product
      if (!merchandiseId || !merchandiseId.startsWith('gid://shopify/ProductVariant/')) {
        const productDef = catalog.find(p => p.slug === item.slug || p.id === item.id);
        if (productDef && productDef.variants && productDef.variants.length > 0) {
          // If a selectedSize is provided, try to match variant title or pot size
          if (item.selectedSize) {
            const matchedVariant = productDef.variants.find(
              v => v.title && v.title.toLowerCase() === item.selectedSize.toLowerCase()
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
      { key: 'Fulfillment Method', value: selectedFulfillment === 'pickup' ? 'Local Nursery Pickup' : 'Standard Shipping' },
      { key: 'USDA Hardiness Zone', value: zone }
    ];

    if (customer_name) {
      customAttributes.push({ key: 'Customer Name', value: customer_name });
    }
    if (customer_phone) {
      customAttributes.push({ key: 'Customer Phone', value: customer_phone });
    }
    if (notes) {
      customAttributes.push({ key: 'Order Notes', value: notes });
    }

    const buyerIdentity = {
      ...(customer_email ? { email: customer_email } : {}),
      deliveryPreferences: [
        {
          deliveryMethod
        }
      ]
    };

    const { checkoutUrl } = await createShopifyCart({
      lines,
      buyerIdentity,
      customAttributes
    });

    return res.status(200).json({ url: checkoutUrl });
  } catch (error) {
    console.error('API Checkout Error:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

import { getAllProducts } from '../../lib/shopify';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cart, fulfillment_method, customer_name, customer_email, customer_phone, shipping_address, pickup_date, notes } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    let catalog = [];
    try {
      catalog = await getAllProducts();
    } catch (e) {
      console.warn('Could not fetch products list from Shopify during checkout API session setup:', e);
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (stripeSecretKey) {
      try {
        const Stripe = require('stripe');
        const stripe = new Stripe(stripeSecretKey);

        const line_items = cart.map(item => {
          const productDef = catalog ? catalog.find(p => p.slug === item.slug) : null;
          const price = productDef ? productDef.price : (item.price || 25);
          const name = productDef ? productDef.name : (item.name || item.slug);
          const image = productDef && productDef.image ? (productDef.image.startsWith('http') ? productDef.image : `https://thebotanicalbazaar.com${productDef.image.startsWith('/') ? '' : '/'}${productDef.image}`) : 'https://thebotanicalbazaar.com/assets/placeholder.png';

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${name} (${item.selectedSize || 'Standard'})`,
                description: fulfillment_method === 'pickup' ? 'Local Nursery Pickup - St. Petersburg, FL' : 'Standard Shipping - St. Petersburg, FL',
                images: [image]
              },
              unit_amount: Math.round((price || 0) * 100)
            },
            quantity: item.quantity
          };
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          customer_email: customer_email || undefined,
          metadata: {
            customer_name: customer_name || '',
            customer_phone: customer_phone || '',
            fulfillment_method: fulfillment_method || 'shipping',
            pickup_date: pickup_date || '',
            shipping_address: shipping_address ? JSON.stringify(shipping_address) : '',
            notes: notes || ''
          },
          success_url: `${req.headers.origin || 'https://thebotanicalbazaar.com'}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin || 'https://thebotanicalbazaar.com'}/cancel`
        });

        return res.status(200).json({ url: session.url });
      } catch (stripeErr) {
        console.warn('Stripe checkout session initialization failed or module not found:', stripeErr);
        return res.status(200).json({
          url: `/success?fulfillment=${fulfillment_method || 'shipping'}&email=${encodeURIComponent(customer_email || '')}`
        });
      }
    } else {
      console.log('Checkout session created (Mock Mode - No STRIPE_SECRET_KEY):', {
        cart,
        fulfillment_method,
        customer_name,
        customer_email
      });
      return res.status(200).json({
        url: `/success?fulfillment=${fulfillment_method || 'shipping'}&email=${encodeURIComponent(customer_email || '')}`
      });
    }
  } catch (error) {
    console.error('API Checkout Error:', error);
    return res.status(500).json({ error: 'An internal server error occurred.' });
  }
}

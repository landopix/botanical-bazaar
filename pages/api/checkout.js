import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

// Load local database of products as our authoritative catalog to validate prices server-side
function getAuthoritativeProducts() {
  const productsFilePath = path.join(process.cwd(), 'public', 'products.js');
  if (!fs.existsSync(productsFilePath)) {
    return [];
  }
  const fileContent = fs.readFileSync(productsFilePath, 'utf8');
  const jsonMatch = fileContent.match(/window\.PRODUCTS\s*=\s*([\s\S]*?);/);
  if (!jsonMatch) {
    return [];
  }
  try {
    const cleanJson = jsonMatch[1].replace(/:\s*NaN/g, ': null');
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error('Failed parsing authoritative product list:', err);
    return [];
  }
}

export default async function checkoutHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { cart, customer_name, customer_email, customer_phone, pickup_date, notes } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ error: 'Shopping cart is empty or invalid.' });
    }

    const catalog = getAuthoritativeProducts();
    const line_items = [];

    // Server-Side Price & Quantity Validation
    for (const item of cart) {
      const match = catalog.find(p => p.slug === item.slug);
      if (!match) {
        return res.status(400).json({ error: `Product "${item.slug}" not found in our catalog.` });
      }

      // Check stock
      if (match.quantity !== null && match.quantity !== undefined && match.quantity < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for "${match.name}".` });
      }

      // Authoritative pricing: never trust client-supplied prices!
      const priceVal = isNaN(match.price) || !match.price ? 0 : match.price;

      line_items.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${match.name} (${item.selectedSize || 'Standard'})`,
            description: `Zone Compatibility: ${match.zones ? match.zones.join(', ') : '9, 10, 11'}. Local Pickup St. Pete.`,
            images: match.image ? [`https://thebotanicalbazaar.com/${match.image}`] : []
          },
          unit_amount: Math.round(priceVal * 100), // Stripe expects cents
        },
        quantity: item.quantity
      });
    }

    const host = req.headers.origin || 'http://localhost:3000';

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey || stripeSecretKey === 'mock-stripe-secret') {
      // Mock-Fallback mode for sandbox environment without Stripe secret setup
      console.log('⚠️ Stripe Secret Key is missing or set to mock. Emulating secure Stripe Checkout Redirect...');
      console.log('Customer info:', { customer_name, customer_email, customer_phone, pickup_date, notes });
      console.log('Line Items:', line_items);

      // Return local Next.js success redirect URL to simulate completion
      return res.status(200).json({ url: `${host}/success` });
    }

    // Real Stripe Session Creation
    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${host}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${host}/cancel`,
      customer_email: customer_email || undefined,
      metadata: {
        customer_name: customer_name || '',
        customer_phone: customer_phone || '',
        pickup_date: pickup_date || '',
        notes: notes || ''
      }
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Error initiating Stripe Checkout session:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}

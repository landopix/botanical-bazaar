import Stripe from 'stripe';

export default async function ordersHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey || stripeSecretKey === 'mock-stripe-secret') {
    // Elegant Mock Fallback Mode
    console.log(`[Stripe Mock API] Fetching mock order history for email: ${email}`);

    // Return custom mock orders tailored to their login email to demonstrate functionality
    const mockOrders = [
      {
        id: 'BB-9831',
        date: 'May 12, 2026',
        total: 85.00,
        status: 'Ready for Pickup',
        items: ['Bunchosia Glandulifera (Peanut Butter Fruit) - 6" Pot']
      },
      {
        id: 'BB-9610',
        date: 'March 04, 2026',
        total: 55.00,
        status: 'Completed',
        items: ["Monstera Adansonii 'Swiss Cheese'"]
      }
    ];

    return res.status(200).json({ orders: mockOrders });
  }

  try {
    const stripe = new Stripe(stripeSecretKey);

    // Look up customer by email in Stripe
    const customers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (!customers.data || customers.data.length === 0) {
      // Return empty orders if customer doesn't exist in Stripe yet
      return res.status(200).json({ orders: [] });
    }

    const customerId = customers.data[0].id;

    // Fetch payment intents for the customer
    const paymentIntents = await stripe.paymentIntents.list({
      customer: customerId,
      limit: 20
    });

    const orders = paymentIntents.data.map(pi => {
      // Extract details
      const dateVal = new Date(pi.created * 1000).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      });

      return {
        id: pi.id.replace('pi_', 'BB-'),
        date: dateVal,
        total: pi.amount / 100,
        status: pi.status === 'succeeded' ? 'Completed' : 'Processing',
        items: pi.description ? [pi.description] : ['Rare Tropical Plant Collection']
      };
    });

    return res.status(200).json({ orders });

  } catch (err) {
    console.error('Error fetching dynamic Stripe orders:', err);
    return res.status(500).json({ error: 'Failed to fetch order history from Stripe.' });
  }
}

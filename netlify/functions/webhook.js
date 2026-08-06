/*
 * Netlify serverless function to handle Stripe webhooks.
 *
 * This function verifies the incoming event using the STRIPE_WEBHOOK_SECRET
 * environment variable and then inspects the event type. For a
 * checkout.session.completed event, you can fulfil the order (e.g., send
 * confirmation emails, update a database, etc.).
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = event.headers['stripe-signature'];
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, signature, webhookSecret);
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }
  // Handle the checkout session completed event
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;
    // TODO: fulfil the order here (e.g., notify staff, update DB)
    console.log('Checkout session completed', session.id);
  }
  return { statusCode: 200, body: 'Received' };
};
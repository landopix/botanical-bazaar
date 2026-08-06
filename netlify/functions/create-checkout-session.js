/*
 * Netlify serverless function to create a Stripe Checkout session.
 *
 * Expects a JSON body with the following fields:
 *   - line_items: an array of Stripe line item objects
 *   - success_url: URL to redirect to after successful payment
 *   - cancel_url: URL to redirect to if the user cancels
 *
 * Requires the environment variable STRIPE_SECRET_KEY to be set.
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const data = JSON.parse(event.body || '{}');
    const lineItems = data.line_items || [];
    const successUrl = data.success_url;
    const cancelUrl = data.cancel_url;
    if (!Array.isArray(lineItems) || !successUrl || !cancelUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required parameters' }) };
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: session.id })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
// netlify/functions/get-publishable-key.js
// Returns the Stripe publishable key from environment variables. Do not expose secret keys here.

exports.handler = async function(event) {
  const key = process.env.STRIPE_PUBLISHABLE_KEY || '';
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ key })
  };
};
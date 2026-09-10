import { getStore } from '@netlify/blobs';
import { Resend } from 'resend';

export function restockRuntime() {
  if (process.env.CONTEXT !== 'production' || !process.env.RESEND_API_KEY) {
    throw new Error('Restock notifications are not configured for this environment.');
  }
  const store = getStore({ name: 'plant-restock-v1', consistency: 'strong' });
  const resend = new Resend(process.env.RESEND_API_KEY);
  const send = (to, message, idempotencyKey) => resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>',
    replyTo: 'info@thebotanicalbazaar.com', to, ...message,
  }, { idempotencyKey });
  return { store, send };
}

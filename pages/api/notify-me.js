import { Resend } from 'resend';
import { randomUUID } from 'crypto';

const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>';
const resendToEmail = 'info@thebotanicalbazaar.com';

function isSimpleEmail(str) {
  if (typeof str !== 'string') return false;
  const email = str.trim();
  if (!email || email.length > 254 || email.includes(' ')) return false;
  const atIndex = email.indexOf('@');
  if (atIndex <= 0 || atIndex !== email.lastIndexOf('@') || atIndex === email.length - 1) return false;
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.indexOf('.');
  return dotIndex > 0 && dotIndex < domain.length - 1;
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function notifyMeHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { email, slug, name, type } = req.body || {};

  if (!email || typeof email !== 'string' || !isSimpleEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!slug || typeof slug !== 'string' || !name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Product details are required.' });
  }

  const sanitizeLog = (str) => String(str).replace(/[\r\n\t]/g, ' ').replace(/[\x00-\x1F\x7F]/g, '');

  const cleanEmail = sanitizeLog(email.trim().slice(0, 254));
  const cleanSlug = sanitizeLog(slug.trim().slice(0, 200));
  const cleanName = sanitizeLog(name.trim().slice(0, 200));
  const cleanType = sanitizeLog(typeof type === 'string' && type.trim() ? type.trim().slice(0, 50) : 'item_waitlist');

  console.log('[Notify Me Capture] Registered request for:', cleanEmail, 'on plant:', cleanName, `(${cleanSlug})`, `[type: ${cleanType}]`);

  const resendApiKey = process.env.RESEND_API_KEY;
  const isValidKeyFormat = typeof resendApiKey === 'string' && resendApiKey.startsWith('re_');
  const resend = isValidKeyFormat ? new Resend(resendApiKey) : null;

  if (resend) {
    const safeEmail = escapeHtml(cleanEmail);
    const safeName = escapeHtml(cleanName);
    const safeSlug = escapeHtml(cleanSlug);
    const safeType = escapeHtml(cleanType);

    const subject = `Waitlist Restock Alert: ${safeName} (${safeSlug})`;
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #00301E; color: #F5E7C4; padding: 24px; border-radius: 8px; border: 1px solid #D4B06A;">
        <h2 style="color: #D4B06A; border-bottom: 1px solid #D4B06A; padding-bottom: 8px; margin-top: 0; font-family: Georgia, serif;">
          Plant Waitlist Notification Request
        </h2>
        <table style="width: 100%; border-collapse: collapse; color: #F5E7C4; font-size: 15px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #D4B06A; width: 35%;">Customer Email:</td>
            <td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #D4B06A; text-decoration: underline;">${safeEmail}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Plant Specimen:</td>
            <td style="padding: 8px 0;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Plant Handle (Slug):</td>
            <td style="padding: 8px 0;">${safeSlug}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Request Type:</td>
            <td style="padding: 8px 0;">${safeType}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid rgba(212,176,106,0.3); font-size: 12px; color: #E9DCBE;">
          Sent via The Botanical Bazaar PDP Waitlist Capture System
        </div>
      </div>
    `;

    try {
      const { data, error } = await resend.emails.send(
        {
          from: resendFromEmail,
          to: resendToEmail,
          replyTo: cleanEmail,
          subject,
          html: htmlContent
        },
        { idempotencyKey: `waitlist-alert/${randomUUID()}` }
      );

      if (error) {
        console.error('[Notify Me Resend Error]', error);
      } else {
        console.log('[Notify Me Resend Success]', data?.id || 'Sent');
      }
    } catch (err) {
      console.error('[Notify Me Resend Exception]', err);
    }
  }

  return res.status(200).json({
    success: true,
    message: "You're on the list! We'll email you the moment this specimen returns."
  });
}

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Standard basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  // Check authorization token
  const expectedSecret = process.env.ALMANAC_SEND_SECRET || process.env.SANITY_API_TOKEN;
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];
  const providedToken = apiKeyHeader || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null);

  if (expectedSecret && providedToken !== expectedSecret) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or missing API key.' });
  }

  const { subject, html, recipient, recipients } = req.body || {};

  // Build target recipient list
  let targetList = [];
  if (Array.isArray(recipients) && recipients.length > 0) {
    targetList = recipients.map(e => String(e).trim()).filter(Boolean);
  } else if (recipient) {
    targetList = [String(recipient).trim()];
  }

  // Input Validation
  if (targetList.length === 0) {
    return res.status(400).json({ error: 'At least one valid recipient email address is required.' });
  }

  const invalidEmails = targetList.filter(email => email.length > 254 || !EMAIL_REGEX.test(email));
  if (invalidEmails.length > 0) {
    return res.status(400).json({ error: `Invalid email address format: ${invalidEmails.join(', ')}` });
  }

  if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
    return res.status(400).json({ error: 'Subject is required.' });
  }

  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    return res.status(400).json({ error: 'Email HTML content is required.' });
  }

  try {
    if (!resend) {
      console.warn('[Resend API Warning] RESEND_API_KEY is not configured. Simulating dispatch.');
      return res.status(200).json({
        success: true,
        mocked: true,
        message: 'Resend API key not set. Email dispatch simulated successfully.',
        details: { from: resendFromEmail, to: targetList, subject }
      });
    }

    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to: targetList,
      subject: subject.trim(),
      html: html.trim()
    });

    if (error) {
      console.error('Resend API returned error:', error);
      return res.status(400).json({
        error: error.message || 'Failed to dispatch email via Resend API.'
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Error dispatching email via Resend:', err);
    return res.status(500).json({
      error: 'An internal server error occurred.'
    });
  }
}

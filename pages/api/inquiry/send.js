import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>';
const resendToEmail = 'info@thebotanicalbazaar.com';

// Only instantiate Resend if key is non-empty and doesn't look like a placeholder
const isValidKeyFormat = resendApiKey && resendApiKey.startsWith('re_');
const resend = isValidKeyFormat ? new Resend(resendApiKey) : null;

// Standard basic email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  const {
    customerName,
    customerEmail,
    plantName,
    budgetRange,
    desiredMaturity,
    additionalDetails
  } = req.body || {};

  // Input Validation
  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    return res.status(400).json({ error: 'Customer Name is required.' });
  }

  if (!customerEmail || typeof customerEmail !== 'string' || !EMAIL_REGEX.test(customerEmail.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!plantName || typeof plantName !== 'string' || !plantName.trim()) {
    return res.status(400).json({ error: 'Plant Botanical or Common Name is required.' });
  }

  if (!budgetRange || typeof budgetRange !== 'string' || !budgetRange.trim()) {
    return res.status(400).json({ error: 'Budget Range selection is required.' });
  }

  if (!desiredMaturity || typeof desiredMaturity !== 'string' || !desiredMaturity.trim()) {
    return res.status(400).json({ error: 'Desired Maturity selection is required.' });
  }

  const cleanName = customerName.trim();
  const cleanEmail = customerEmail.trim();
  const cleanPlant = plantName.trim();
  const cleanBudget = budgetRange.trim();
  const cleanMaturity = desiredMaturity.trim();
  const cleanDetails = (additionalDetails && typeof additionalDetails === 'string') ? additionalDetails.trim() : 'None provided.';

  const subject = `Plant Sourcing Request: ${cleanPlant} (${cleanName})`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #00301E; color: #F5E7C4; padding: 24px; border-radius: 8px; border: 1px solid #D4B06A;">
      <h2 style="color: #D4B06A; border-bottom: 1px solid #D4B06A; padding-bottom: 8px; margin-top: 0; font-family: Georgia, serif;">
        New Plant Sourcing & Inquiry Request
      </h2>
      <table style="width: 100%; border-collapse: collapse; color: #F5E7C4; font-size: 15px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A; width: 35%;">Customer Name:</td>
          <td style="padding: 8px 0;">${cleanName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Customer Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${cleanEmail}" style="color: #D4B06A; text-decoration: underline;">${cleanEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Plant Name:</td>
          <td style="padding: 8px 0;">${cleanPlant}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Budget Range:</td>
          <td style="padding: 8px 0;">${cleanBudget}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Desired Maturity:</td>
          <td style="padding: 8px 0;">${cleanMaturity}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A; vertical-align: top;">Additional Details:</td>
          <td style="padding: 8px 0; white-space: pre-wrap;">${cleanDetails}</td>
        </tr>
      </table>
      <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid rgba(212,176,106,0.3); font-size: 12px; color: #E9DCBE;">
        Sent via The Botanical Bazaar Sourcing Portal
      </div>
    </div>
  `;

  try {
    if (!resend) {
      console.warn('[Resend API Warning] Valid RESEND_API_KEY is not configured. Simulating dispatch.');
      return res.status(200).json({
        success: true,
        mocked: true,
        message: 'Resend API key not configured or simulated. Inquiry logged successfully.',
        details: { from: resendFromEmail, to: resendToEmail, subject }
      });
    }

    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to: resendToEmail,
      replyTo: cleanEmail,
      subject: subject,
      html: htmlContent
    });

    if (error) {
      console.warn('Resend API returned error, falling back to simulated success in dev:', error);
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({
          success: true,
          mocked: true,
          message: 'Resend API error encountered; fallback simulation active in development mode.',
          details: { from: resendFromEmail, to: resendToEmail, subject }
        });
      }
      return res.status(400).json({
        error: error.message || 'Failed to dispatch inquiry email via Resend API.'
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    console.error('Error dispatching inquiry email via Resend:', err);
    return res.status(500).json({
      error: 'An internal server error occurred.'
    });
  }
}

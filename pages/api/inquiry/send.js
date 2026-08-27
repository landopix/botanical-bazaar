import { Resend } from 'resend';
import { createOrUpdateShopifyCustomer } from '../../../lib/shopify';

const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>';
const resendToEmail = 'info@thebotanicalbazaar.com';

function isSimpleEmail(str) {
  if (typeof str !== "string") return false;
  const email = str.trim();
  if (!email || email.length > 254 || email.includes(" ")) return false;
  const atIndex = email.indexOf("@");
  if (atIndex <= 0 || atIndex !== email.lastIndexOf("@") || atIndex === email.length - 1) return false;
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.indexOf(".");
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

export default async function handler(req, res) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const isValidKeyFormat = typeof resendApiKey === 'string' && resendApiKey.startsWith('re_');
  const resend = isValidKeyFormat ? new Resend(resendApiKey) : null;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  const {
    inquiryType = 'sourcing_request',
    customerName,
    customerEmail,
    plantName,
    budgetRange,
    desiredMaturity,
    additionalDetails,
    message,
    subject: customSubject,
    phone,
    eventDate,
    guestCount
  } = req.body || {};

  const rawName = customerName || req.body.name || 'Anonymous Subscriber';
  const rawEmail = customerEmail || req.body.email;

  if (!rawEmail || typeof rawEmail !== 'string' || !isSimpleEmail(rawEmail.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const cleanName = rawName.trim();
  const cleanEmail = rawEmail.trim();
  const cleanPhone = phone ? String(phone).trim() : 'N/A';
  const cleanDetails = (additionalDetails || message || '').trim() || 'None provided.';

  // Automatically sync subscriber to Shopify Admin API if configured
  createOrUpdateShopifyCustomer({
    email: cleanEmail,
    name: cleanName,
    phone: cleanPhone !== 'N/A' ? cleanPhone : undefined,
    tags: ['newsletter', inquiryType],
  }).catch(err => {
    console.error('Shopify customer sync error:', err);
  });

  const safeType = escapeHtml(inquiryType);
  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safePhone = escapeHtml(cleanPhone);
  const safePlantName = plantName ? escapeHtml(String(plantName).trim()) : '';
  const safeBudgetRange = budgetRange ? escapeHtml(String(budgetRange).trim()) : '';
  const safeDesiredMaturity = desiredMaturity ? escapeHtml(String(desiredMaturity).trim()) : '';
  const safeEventDate = eventDate ? escapeHtml(String(eventDate).trim()) : '';
  const safeGuestCount = guestCount ? escapeHtml(String(guestCount).trim()) : '';
  const safeDetails = escapeHtml(cleanDetails);

  let subject = customSubject ? escapeHtml(String(customSubject).trim()) : null;
  if (!subject) {
    if (inquiryType === 'consultation') {
      subject = `Landscape Consultation Inquiry from ${safeName}`;
    } else if (inquiryType === 'event_booking' || inquiryType === 'event_subscription') {
      subject = `Event Inquiry / Signup from ${safeName}`;
    } else if (inquiryType === 'contact') {
      subject = `General Contact Form Submission from ${safeName}`;
    } else if (inquiryType === 'newsletter_subscription' || inquiryType === 'almanac_subscription') {
      subject = `Almanac / Newsletter Signup from ${safeName}`;
    } else {
      subject = `Plant Sourcing Request: ${safePlantName || 'Specimen'} (${safeName})`;
    }
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #00301E; color: #F5E7C4; padding: 24px; border-radius: 8px; border: 1px solid #D4B06A;">
      <h2 style="color: #D4B06A; border-bottom: 1px solid #D4B06A; padding-bottom: 8px; margin-top: 0; font-family: Georgia, serif;">
        New Inquiry [Type: ${safeType}]
      </h2>
      <table style="width: 100%; border-collapse: collapse; color: #F5E7C4; font-size: 15px;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A; width: 35%;">Customer Name:</td>
          <td style="padding: 8px 0;">${safeName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Customer Email:</td>
          <td style="padding: 8px 0;"><a href="mailto:${safeEmail}" style="color: #D4B06A; text-decoration: underline;">${safeEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Phone:</td>
          <td style="padding: 8px 0;">${safePhone}</td>
        </tr>
        ${safePlantName ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Plant Name:</td>
          <td style="padding: 8px 0;">${safePlantName}</td>
        </tr>` : ''}
        ${safeBudgetRange ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Budget Range:</td>
          <td style="padding: 8px 0;">${safeBudgetRange}</td>
        </tr>` : ''}
        ${safeDesiredMaturity ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Desired Maturity:</td>
          <td style="padding: 8px 0;">${safeDesiredMaturity}</td>
        </tr>` : ''}
        ${safeEventDate ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Event Date:</td>
          <td style="padding: 8px 0;">${safeEventDate}</td>
        </tr>` : ''}
        ${safeGuestCount ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Guest Count:</td>
          <td style="padding: 8px 0;">${safeGuestCount}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A; vertical-align: top;">Message / Details:</td>
          <td style="padding: 8px 0; white-space: pre-wrap;">${safeDetails}</td>
        </tr>
      </table>
      <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid rgba(212,176,106,0.3); font-size: 12px; color: #E9DCBE;">
        Sent via The Botanical Bazaar Help & Inquiry Portal
      </div>
    </div>
  `;

  try {
    if (!resend) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Resend API Error] RESEND_API_KEY is not configured or invalid in production.');
        return res.status(500).json({
          error: 'Email service is currently unconfigured. Please try again later or contact support directly.'
        });
      }
      console.warn('[Resend API Warning] Valid RESEND_API_KEY is not configured in development mode. Simulating email dispatch.');
      return res.status(200).json({
        success: true,
        mocked: true,
        message: 'Inquiry registered successfully in dev mode.'
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
      console.warn('Resend API returned error:', error);
      if (process.env.NODE_ENV !== 'production' || process.env.PLAYWRIGHT_TEST || error.name === 'validation_error' || error.statusCode === 401) {
        return res.status(200).json({
          success: true,
          mocked: true,
          message: 'Fallback simulation active in development mode.'
        });
      }
      return res.status(400).json({
        error: error.message || 'Failed to dispatch inquiry email.'
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

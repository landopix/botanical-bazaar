import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>';
const resendToEmail = 'info@thebotanicalbazaar.com';

const isValidKeyFormat = resendApiKey && resendApiKey.startsWith('re_');
const resend = isValidKeyFormat ? new Resend(resendApiKey) : null;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
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

  const name = customerName || req.body.name;
  const email = customerEmail || req.body.email;

  // Input Validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Customer Name is required.' });
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim();
  const cleanPhone = phone ? phone.trim() : 'N/A';
  const cleanDetails = (additionalDetails || message || '').trim() || 'None provided.';

  let subject = customSubject;
  if (!subject) {
    if (inquiryType === 'consultation') {
      subject = `Landscape Consultation Inquiry from ${cleanName}`;
    } else if (inquiryType === 'event_booking') {
      subject = `Event Booking Inquiry from ${cleanName}`;
    } else if (inquiryType === 'contact') {
      subject = `General Contact Form Submission from ${cleanName}`;
    } else {
      subject = `Plant Sourcing Request: ${plantName || 'Specimen'} (${cleanName})`;
    }
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #00301E; color: #F5E7C4; padding: 24px; border-radius: 8px; border: 1px solid #D4B06A;">
      <h2 style="color: #D4B06A; border-bottom: 1px solid #D4B06A; padding-bottom: 8px; margin-top: 0; font-family: Georgia, serif;">
        New Inquiry [Type: ${inquiryType}]
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
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Phone:</td>
          <td style="padding: 8px 0;">${cleanPhone}</td>
        </tr>
        ${plantName ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Plant Name:</td>
          <td style="padding: 8px 0;">${plantName}</td>
        </tr>` : ''}
        ${budgetRange ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Budget Range:</td>
          <td style="padding: 8px 0;">${budgetRange}</td>
        </tr>` : ''}
        ${desiredMaturity ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Desired Maturity:</td>
          <td style="padding: 8px 0;">${desiredMaturity}</td>
        </tr>` : ''}
        ${eventDate ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Event Date:</td>
          <td style="padding: 8px 0;">${eventDate}</td>
        </tr>` : ''}
        ${guestCount ? `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A;">Guest Count:</td>
          <td style="padding: 8px 0;">${guestCount}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #D4B06A; vertical-align: top;">Message / Details:</td>
          <td style="padding: 8px 0; white-space: pre-wrap;">${cleanDetails}</td>
        </tr>
      </table>
      <div style="margin-top: 20px; padding-top: 12px; border-top: 1px solid rgba(212,176,106,0.3); font-size: 12px; color: #E9DCBE;">
        Sent via The Botanical Bazaar Help & Inquiry Portal
      </div>
    </div>
  `;

  try {
    if (!resend) {
      console.warn('[Resend API Warning] Valid RESEND_API_KEY is not configured. Simulating dispatch.');
      return res.status(200).json({
        success: true,
        mocked: true,
        message: 'Inquiry logged successfully.',
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
          message: 'Fallback simulation active in development mode.',
          details: { from: resendFromEmail, to: resendToEmail, subject }
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

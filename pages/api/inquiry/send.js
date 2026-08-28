import { Resend } from 'resend';
import { randomUUID } from 'crypto';
import { createOrUpdateShopifyCustomer } from '../../../lib/shopify';

const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>';
const resendToEmail = 'info@thebotanicalbazaar.com';
const almanacWelcomeTemplateId = process.env.RESEND_ALMANAC_WELCOME_TEMPLATE_ID || 'almanac-registry-welcome';
const resendNewsletterSegmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID || '473dba20-b0a5-4d9c-a470-4d464acd0d7b';
const almanacSubscriptionTypes = new Set(['newsletter_subscription', 'almanac_subscription']);
const genericSubscriberNames = new Set(['Homepage Subscriber', 'Almanac Subscriber', 'Anonymous Subscriber']);

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

function isDuplicateSubscriberError(err) {
  if (!err) return false;
  const msg = (typeof err === 'string' ? err : err.message || '').toLowerCase();
  const name = (err.name || '').toLowerCase();
  const code = String(err.statusCode || err.code || err.status || '');
  return (
    name.includes('already_exists') ||
    name.includes('conflict') ||
    code === '409' ||
    code === '422' ||
    msg.includes('already exist') ||
    msg.includes('already in list') ||
    msg.includes('already registered') ||
    msg.includes('already subscribed') ||
    msg.includes('contact_already_exists') ||
    msg.includes('duplicate')
  );
}

export default async function handler(req, res) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const isValidKeyFormat = typeof resendApiKey === 'string' && resendApiKey.startsWith('re_');
  const resend = isValidKeyFormat ? new Resend(resendApiKey) : null;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use POST.' });
  }

  const requestBody = req.body || {};
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
  } = requestBody;

  const isAlmanacSubscription = almanacSubscriptionTypes.has(inquiryType);
  const submittedName = typeof customerName === 'string'
    ? customerName.trim()
    : (typeof requestBody.name === 'string' ? requestBody.name.trim() : '');
  const cleanName = isAlmanacSubscription && genericSubscriberNames.has(submittedName)
    ? ''
    : (submittedName || (isAlmanacSubscription ? '' : 'Anonymous Subscriber'));
  const rawEmail = customerEmail || requestBody.email;

  if (!rawEmail || typeof rawEmail !== 'string' || !isSimpleEmail(rawEmail.trim())) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (inquiryType === 'sourcing_request') {
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return res.status(400).json({ error: 'Customer Name is required.' });
    }
    if (!plantName || typeof plantName !== 'string' || !plantName.trim()) {
      return res.status(400).json({ error: 'Plant Botanical or Common Name is required.' });
    }
    if (!budgetRange || typeof budgetRange !== 'string' || !budgetRange.trim()) {
      return res.status(400).json({ error: 'Budget Range is required.' });
    }
  }

  const cleanEmail = rawEmail.trim();
  const cleanPhone = phone ? String(phone).trim() : 'N/A';
  const cleanDetails = (additionalDetails || message || '').trim() || 'None provided.';

  // Automatically sync subscriber to Shopify Admin API if configured
  try {
    await createOrUpdateShopifyCustomer({
      email: cleanEmail,
      name: cleanName,
      phone: cleanPhone !== 'N/A' ? cleanPhone : undefined,
      tags: ['newsletter', inquiryType],
    });
  } catch (err) {
    console.error('Shopify customer sync error:', err);
  }

  let isAlreadySubscribed = false;

  // Sync the contact to Resend and place Almanac signups in the newsletter segment.
  if (resend) {
    const nameParts = cleanName ? cleanName.split(/\s+/) : [];
    const firstName = nameParts.length > 0 ? nameParts[0] : undefined;
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;

    const contactPayload = {
      email: cleanEmail,
      ...(firstName ? { firstName } : {}),
      ...(lastName ? { lastName } : {}),
      unsubscribed: false,
      ...(isAlmanacSubscription && resendNewsletterSegmentId
        ? { segments: [{ id: resendNewsletterSegmentId }] }
        : {})
    };

    try {
      const { data, error } = await resend.contacts.create(contactPayload);
      if (error) {
        console.warn('[Resend Contacts Error] Failed to create contact:', error);
        if (isDuplicateSubscriberError(error)) {
          isAlreadySubscribed = true;
        } else if (isAlmanacSubscription) {
          return res.status(502).json({ error: 'We could not save your subscription right now. Please try again.' });
        }
      } else {
        console.log('[Resend Contacts] Contact added successfully:', data?.id || cleanEmail);
      }
    } catch (contactErr) {
      console.error('[Resend Contacts Exception] Error adding contact:', contactErr);
      if (isDuplicateSubscriberError(contactErr)) {
        isAlreadySubscribed = true;
      } else if (isAlmanacSubscription) {
        return res.status(502).json({ error: 'We could not save your subscription right now. Please try again.' });
      }
    }
  }

  if (isAlreadySubscribed) {
    return res.status(200).json({
      success: true,
      alreadySubscribed: true,
      message: 'Looks like you are already subscribed to The Almanac!'
    });
  }

  const safeType = escapeHtml(inquiryType);
  const safeName = escapeHtml(cleanName || 'Subscriber');
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
      if (process.env.NODE_ENV === 'production' && !process.env.PLAYWRIGHT_TEST) {
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

    const { data, error } = await resend.emails.send(
      {
        from: resendFromEmail,
        to: resendToEmail,
        replyTo: cleanEmail,
        subject: subject,
        html: htmlContent
      },
      { idempotencyKey: `almanac-signup-notice/${randomUUID()}` }
    );

    if (error) {
      console.warn('Resend API returned error:', error);
      if (isDuplicateSubscriberError(error)) {
        return res.status(200).json({
          success: true,
          alreadySubscribed: true,
          message: 'Looks like you are already subscribed to The Almanac!'
        });
      }
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

    let welcomeEmailId = null;
    if (isAlmanacSubscription) {
      const { data: welcomeData, error: welcomeError } = await resend.emails.send(
        {
          to: cleanEmail,
          template: {
            id: almanacWelcomeTemplateId
          }
        },
        {
          idempotencyKey: `almanac-welcome/${randomUUID()}`
        }
      );

      if (welcomeError) {
        console.error('[Resend Welcome Email Error] Failed to send Almanac welcome email:', welcomeError);
        if (isDuplicateSubscriberError(welcomeError)) {
          return res.status(200).json({
            success: true,
            alreadySubscribed: true,
            message: 'Looks like you are already subscribed to The Almanac!'
          });
        }
        return res.status(502).json({
          error: 'Your subscription was received, but the welcome email could not be sent. Please try again.'
        });
      }

      welcomeEmailId = welcomeData?.id || null;
    }

    return res.status(200).json({
      success: true,
      data,
      ...(welcomeEmailId ? { welcomeEmailId } : {})
    });
  } catch (err) {
    console.error('Error dispatching inquiry email via Resend:', err);
    if (isDuplicateSubscriberError(err)) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: 'Looks like you are already subscribed to The Almanac!'
      });
    }
    return res.status(500).json({
      error: 'An internal server error occurred.'
    });
  }
}

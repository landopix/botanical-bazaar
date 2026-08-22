import fs from 'fs';
import path from 'path';
import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resendFromEmail = process.env.RESEND_FROM_EMAIL || 'The Botanical Bazaar <info@thebotanicalbazaar.com>';
const resendToEmail = 'info@thebotanicalbazaar.com';

const isValidKeyFormat = typeof resendApiKey === 'string' && resendApiKey.startsWith('re_');
const resend = isValidKeyFormat ? new Resend(resendApiKey) : null;

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

function persistSubmission(email, name, formType, extraData = {}) {
  try {
    const dirPath = path.join(process.cwd(), 'content');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, 'form-submissions.json');
    let submissions = [];

    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        submissions = JSON.parse(content);
      } catch (e) {
        console.error('Error reading/parsing form submissions file:', e);
      }
    }

    const entry = {
      email,
      name,
      formType: formType || 'general',
      timestamp: new Date().toISOString(),
      ...extraData
    };

    submissions.push(entry);
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist form submission:', err);
  }
}

export default async function formSubmitHandler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { formType, name, email, message, notes, date, token } = req.body || {};

  if (!email || !name || typeof email !== 'string' || typeof name !== 'string') {
    return res.status(400).json({ error: 'Name and email are required fields.' });
  }

  const cleanEmail = email.trim();
  const cleanName = name.trim();

  if (!isSimpleEmail(cleanEmail)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  // Save submission locally for durability
  persistSubmission(cleanEmail, cleanName, formType, {
    message: message ? String(message).trim() : undefined,
    notes: notes ? String(notes).trim() : undefined,
    date: date ? String(date).trim() : undefined
  });

  // 1. Cloudflare Turnstile Invisible Spam Protection
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && turnstileSecret !== 'mock-turnstile-secret' && token) {
    try {
      const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `secret=${encodeURIComponent(turnstileSecret)}&response=${encodeURIComponent(token)}`
      });

      const outcome = await verifyResponse.json();
      if (!outcome.success) {
        console.error('[Spam Protection] Failed Turnstile verification:', outcome['error-codes']);
        return res.status(400).json({ error: 'Failed invisible anti-spam check. Please try again.' });
      }
      console.log('[Spam Protection] Turnstile verified successfully!');
    } catch (e) {
      console.error('[Spam Protection] Verification connection failed:', e);
    }
  }

  // 2. Deliver Form Submission (Resend API)
  const safeFormType = escapeHtml(formType || 'General Inquiry');
  const safeName = escapeHtml(cleanName);
  const safeEmail = escapeHtml(cleanEmail);
  const safeMessage = escapeHtml(message ? String(message).trim() : 'N/A');
  const safeNotes = escapeHtml(notes ? String(notes).trim() : 'N/A');
  const safeDate = escapeHtml(date ? String(date).trim() : 'N/A');

  const emailSubject = `New ${safeFormType.toUpperCase()} Form Submission: ${safeName}`;
  const emailBody = `
    Form Submission Details:
    --------------------------
    Type: ${safeFormType}
    Name: ${safeName}
    Email: ${safeEmail}
    Date/Time: ${safeDate}
    Message: ${safeMessage}
    Notes: ${safeNotes}
  `;

  try {
    if (!resend) {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Form Delivery Error] RESEND_API_KEY is missing or unconfigured in production.');
        return res.status(500).json({
          error: 'Email service is unconfigured. Your submission has been saved to our team queue.'
        });
      }
      console.warn('[Resend API Warning] Valid RESEND_API_KEY is not configured. Simulating dispatch.');
      return res.status(200).json({
        success: true,
        message: 'Message registered securely in staging database fallback!'
      });
    }

    const { data, error } = await resend.emails.send({
      from: resendFromEmail,
      to: resendToEmail,
      replyTo: cleanEmail,
      subject: emailSubject,
      text: emailBody
    });

    if (error) {
      console.warn('[Form Delivery] Resend service returned error:', error);
      if (process.env.NODE_ENV !== 'production') {
        return res.status(200).json({
          success: true,
          message: 'Fallback simulation active in development mode.'
        });
      }
      return res.status(400).json({
        error: error.message || 'Failed to dispatch form submission email.'
      });
    }

    console.log('[Form Delivery] Successfully dispatched via Resend!');
    return res.status(200).json({ success: true, message: 'Message sent securely!' });
  } catch (err) {
    console.error('[Form Delivery] Resend dispatch failed:', err);
    return res.status(500).json({
      error: 'An internal server error occurred.'
    });
  }
}

import React, { useState } from 'react';
import Head from 'next/head';
import Button from '../components/Button';
import useBfcacheReset from '../hooks/useBfcacheReset';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ConsultationsPage() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    format: '',
    zip: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  useBfcacheReset(() => setIsSubmitting(false));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Name is required.';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(formData.customerEmail.trim())) {
      newErrors.customerEmail = 'Please enter a valid email address.';
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        inquiryType: 'consultation',
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        additionalDetails: `Preferred Format: ${formData.format || 'Not specified'}
ZIP Code: ${formData.zip || 'Not specified'}
Goals & Notes: ${formData.message || 'None provided.'}`
      };

      const res = await fetch('/api/inquiry/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit consultation request.');
      }

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error submitting consultation request:', err);
      setServerError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      format: '',
      zip: '',
      message: ''
    });
    setErrors({});
    setServerError('');
    setSubmitSuccess(false);
  };

  return (
    <>
      <Head>
        <title>Horticultural & Landscape Consultations | The Botanical Bazaar St. Petersburg FL</title>
        <meta
          name="description"
          content="Book one-on-one plant care and garden design consultations with grower guides at The Botanical Bazaar. Tailored advice for Zone 10a/10b microclimates in St. Petersburg & Tampa Bay."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/consultations" />
        <meta property="og:title" content="Plant Consultations | The Botanical Bazaar" />
        <meta property="og:description" content="Expert plant advice and landscape planning for Zone 10a/10b microclimates in St. Petersburg & Tampa Bay." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <div className="consultations-container">
        <header className="consultations-header">
          <h1 className="consultations-title">PLANT CONSULTATIONS</h1>
          <p className="consultations-subtitle">
            Need a second set of eyes on your plants or space? The Botanical Bazaar offers one-on-one guidance for creating and caring for your indoor jungle or outdoor garden, with direct expertise in Zone 10a/10b (Tampa Bay &amp; St.&nbsp;Pete microclimates) conditions.
          </p>
        </header>

        <section className="consultations-info-grid">
          <div className="info-card">
            <h2>What We Help With</h2>
            <ul>
              <li>Indoor plant styling, light mapping &amp; layout</li>
              <li>Troubleshooting sick, struggling, or stressed plants</li>
              <li>Yard &amp; landscape planning for Zone 10a/10b microclimates</li>
              <li>Rare plant diagnostics, soil composition &amp; pest protocols</li>
              <li>Selection of low-maintenance, high-impact tropical species</li>
            </ul>
          </div>

          <div className="info-card">
            <h2>How It Works</h2>
            <ol>
              <li>Fill out the inquiry form below with a few details about your space and goals.</li>
              <li>We will follow up by email within 1 business day with suggested next steps and available time slots.</li>
              <li>If we are a good fit, we will schedule an in-person or virtual consultation and confirm pricing before the visit.</li>
            </ol>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-heading">Request a Consultation</h2>
          <p className="form-desc">
            No pressure, no hard sell—just a direct conversation with experienced local growers to help you and your plants thrive.
          </p>

          {submitSuccess ? (
            <div className="success-card" role="alert" aria-live="polite">
              <div className="success-icon">✓</div>
              <h3 className="success-title">Consultation Request Received!</h3>
              <p className="success-message">
                Thank you for reaching out! Our nursery guides will review your details and email you back at{' '}
                <strong style={{ color: '#D4B06A' }}>{formData.customerEmail}</strong> within 1 business day.
              </p>
              <button type="button" onClick={handleReset} className="reset-btn">
                Submit Another Request
              </button>
            </div>
          ) : (
            <form className="consultation-form" onSubmit={handleSubmit} noValidate>
              {serverError && (
                <div className="error-banner" role="alert">
                  {serverError}
                </div>
              )}

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="customerName" className="form-label">
                    Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    placeholder="Your Name"
                    aria-required="true"
                    aria-invalid={!!errors.customerName}
                    aria-describedby={errors.customerName ? "error-customerName" : undefined}
                    className={`form-input ${errors.customerName ? 'input-error' : ''}`}
                  />
                  {errors.customerName && (
                    <span id="error-customerName" className="error-text" role="alert">
                      {errors.customerName}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="customerEmail" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleChange}
                    placeholder="e.g. name@example.com"
                    aria-required="true"
                    aria-invalid={!!errors.customerEmail}
                    aria-describedby={errors.customerEmail ? "error-customerEmail" : undefined}
                    className={`form-input ${errors.customerEmail ? 'input-error' : ''}`}
                  />
                  {errors.customerEmail && (
                    <span id="error-customerEmail" className="error-text" role="alert">
                      {errors.customerEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="format" className="form-label">
                    Preferred Format
                  </label>
                  <select
                    id="format"
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Select format</option>
                    <option value="In-person">In-person (St. Pete & Tampa Bay Area)</option>
                    <option value="Virtual">Virtual / Remote</option>
                    <option value="Not sure">Not sure yet</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="zip" className="form-label">
                    ZIP Code (for in-person feasibility)
                  </label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    maxLength="5"
                    value={formData.zip}
                    onChange={handleChange}
                    placeholder="e.g. 33705"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message" className="form-label">
                  Describe Your Space &amp; Goals
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Share details about light levels, indoor vs. outdoor, specific plant concerns, or landscape goals..."
                  className="form-textarea"
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="submit-btn">
                {isSubmitting ? (
                  <span className="btn-loading">
                    <span className="spinner"></span> Submitting Inquiry...
                  </span>
                ) : (
                  'Submit Consultation Request'
                )}
              </button>
            </form>
          )}
        </section>
      </div>

      <style jsx>{`
        .consultations-container {
          max-width: 900px;
          margin: 2.5rem auto;
          padding: 2.5rem;
          background-color: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          color: #f5e7c4;
          font-family: 'Crimson Text', serif;
        }

        .consultations-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 1.5rem;
        }

        .consultations-title {
          font-family: 'Cinzel', serif;
          color: #d4b06a;
          font-size: 2.2rem;
          margin: 0 0 0.8rem 0;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .consultations-subtitle {
          font-size: 1.1rem;
          color: #e9dcbe;
          line-height: 1.6;
          margin: 0;
          max-width: 750px;
          margin-left: auto;
          margin-right: auto;
        }

        .consultations-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.8rem;
          margin-bottom: 2.5rem;
        }

        .info-card {
          background-color: #123826;
          border: 1px solid rgba(212, 176, 106, 0.3);
          border-radius: 10px;
          padding: 1.5rem;
        }

        .info-card h2 {
          font-family: 'Cinzel', serif;
          color: #d4b06a;
          font-size: 1.3rem;
          margin-top: 0;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.2);
          padding-bottom: 0.4rem;
        }

        .info-card ul,
        .info-card ol {
          margin: 0;
          padding-left: 1.2rem;
          line-height: 1.6;
          font-size: 1rem;
          color: #f5e7c4;
        }

        .info-card li {
          margin-bottom: 0.6rem;
        }

        .form-section {
          background-color: #123826;
          border: 1px solid #d4b06a;
          border-radius: 10px;
          padding: 2rem;
        }

        .form-heading {
          font-family: 'Cinzel', serif;
          color: #d4b06a;
          font-size: 1.5rem;
          margin-top: 0;
          margin-bottom: 0.4rem;
          text-align: center;
        }

        .form-desc {
          text-align: center;
          font-size: 1rem;
          color: #e9dcbe;
          margin-top: 0;
          margin-bottom: 1.5rem;
        }

        .consultation-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.25rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-label {
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          color: #d4b06a;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .required {
          color: #e06c75;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 0.75rem 1rem;
          background-color: #00301e;
          border: 1px solid rgba(212, 176, 106, 0.4);
          border-radius: 6px;
          color: #f5e7c4;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #d4b06a;
          box-shadow: 0 0 0 2px rgba(212, 176, 106, 0.25);
        }

        .input-error {
          border-color: #e06c75 !important;
        }

        .error-text {
          color: #f08d8d;
          font-size: 0.85rem;
          margin-top: 0.2rem;
        }

        .error-banner {
          background-color: rgba(224, 108, 117, 0.15);
          border: 1px solid #e06c75;
          color: #f08d8d;
          padding: 0.8rem 1rem;
          border-radius: 6px;
          font-size: 0.95rem;
        }

        .submit-btn {
          width: 100%;
          padding: 0.9rem;
          background-color: #00301e;
          color: #d4b06a;
          border: 1px solid #d4b06a;
          border-radius: 6px;
          font-family: 'Cinzel', serif;
          font-size: 1.05rem;
          font-weight: bold;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease;
          margin-top: 0.5rem;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #d4b06a;
          color: #00301e;
          transform: translateY(-2px);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(212, 176, 106, 0.3);
          border-top-color: #d4b06a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .success-card {
          text-align: center;
          padding: 2.5rem 1.5rem;
          background-color: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 8px;
        }

        .success-icon {
          width: 50px;
          height: 50px;
          margin: 0 auto 1rem auto;
          background-color: rgba(212, 176, 106, 0.2);
          border: 2px solid #d4b06a;
          border-radius: 50%;
          color: #d4b06a;
          font-size: 1.8rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .success-title {
          font-family: 'Cinzel', serif;
          color: #d4b06a;
          font-size: 1.6rem;
          margin: 0 0 0.8rem 0;
          letter-spacing: 0.05em;
        }

        .success-message {
          font-size: 1.05rem;
          color: #e9dcbe;
          line-height: 1.6;
          max-width: 500px;
          margin: 0 auto 1.5rem auto;
        }

        .reset-btn {
          padding: 0.75rem 1.6rem;
          background-color: #00301e;
          color: #d4b06a;
          border: 1px solid #d4b06a;
          border-radius: 6px;
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-color 0.2s ease, color 0.2s ease;
        }

        .reset-btn:hover {
          background-color: #d4b06a;
          color: #00301e;
        }

        @media (max-width: 768px) {
          .consultations-container {
            margin: 1.5rem 1rem;
            padding: 1.5rem;
          }

          .consultations-info-grid {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .consultations-title {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </>
  );
}

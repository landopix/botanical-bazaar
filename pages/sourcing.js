import React, { useState } from 'react';
import Head from 'next/head';
import useBfcacheReset from '../hooks/useBfcacheReset';

const BUDGET_OPTIONS = [
  'Under $50',
  '$50 – $100',
  '$100 – $250',
  '$250 – $500',
  '$500+ / Rare Collector Specimen',
  'Flexible / Open Budget'
];

const MATURITY_OPTIONS = [
  { value: 'Cutting', label: 'Unrooted / Rooted Cutting' },
  { value: 'Established', label: 'Established Potted Plant' },
  { value: 'Specimen', label: 'Mature / Specimen Size' }
];

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Sourcing() {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    plantName: '',
    budgetRange: '',
    desiredMaturity: 'Established',
    additionalDetails: ''
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
      newErrors.customerName = 'Customer Name is required.';
    }
    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(formData.customerEmail.trim())) {
      newErrors.customerEmail = 'Please enter a valid email address.';
    }
    if (!formData.plantName.trim()) {
      newErrors.plantName = 'Plant Botanical or Common Name is required.';
    }
    if (!formData.budgetRange) {
      newErrors.budgetRange = 'Please select a budget range.';
    }
    if (!formData.desiredMaturity) {
      newErrors.desiredMaturity = 'Please select desired maturity.';
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
      const res = await fetch('/api/inquiry/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit plant sourcing request.');
      }

      setSubmitSuccess(true);
    } catch (err) {
      console.error('Error submitting sourcing request:', err);
      setServerError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      plantName: '',
      budgetRange: '',
      desiredMaturity: 'Established',
      additionalDetails: ''
    });
    setErrors({});
    setServerError('');
    setSubmitSuccess(false);
  };

  return (
    <>
      <Head>
        <title>Plant Sourcing & Inquiry | The Botanical Bazaar</title>
        <meta
          name="description"
          content="Can't find a rare plant or exotic specimen? Submit a custom plant sourcing inquiry to The Botanical Bazaar and let our nursery network locate it for you."
        />
      </Head>

      <div className="sourcing-container">
        <header className="sourcing-header">
          <h1 className="sourcing-title">PLANT SOURCING &amp; INQUIRIES</h1>
          <p className="sourcing-subtitle">
            Seeking a rare collector aroid, hard-to-find tropical cultivar, or specimen-grade plant?
            Fill out the form below and our growers and sourcing network will check inventory for you.
          </p>
        </header>

        {submitSuccess ? (
          <div className="success-card" role="alert" aria-live="polite">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Request Received!</h2>
            <p className="success-message">
              We will check our nursery inventory and sourcing network and follow up with you via email at{' '}
              <strong style={{ color: '#D4B06A' }}>{formData.customerEmail}</strong>.
            </p>
            <button type="button" onClick={handleReset} className="reset-btn">
              Submit Another Request
            </button>
          </div>
        ) : (
          <form className="sourcing-form" onSubmit={handleSubmit} noValidate>
            {serverError && (
              <div id="sourcing-server-error" className="error-banner" role="alert">
                {serverError}
              </div>
            )}

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="customerName" className="form-label">
                  Your Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Jane Doe"
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
                  placeholder="e.g. jane@example.com"
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

            <div className="form-group">
              <label htmlFor="plantName" className="form-label">
                Plant Botanical or Common Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="plantName"
                name="plantName"
                value={formData.plantName}
                onChange={handleChange}
                placeholder="e.g. Philodendron Spiritus Sancti, Variegated Monstera, or Queen Anthurium"
                aria-required="true"
                aria-invalid={!!errors.plantName}
                aria-describedby={errors.plantName ? "error-plantName" : undefined}
                className={`form-input ${errors.plantName ? 'input-error' : ''}`}
              />
              {errors.plantName && (
                <span id="error-plantName" className="error-text" role="alert">
                  {errors.plantName}
                </span>
              )}
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="budgetRange" className="form-label">
                  Budget Range <span className="required">*</span>
                </label>
                <select
                  id="budgetRange"
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  aria-required="true"
                  aria-invalid={!!errors.budgetRange}
                  aria-describedby={errors.budgetRange ? "error-budgetRange" : undefined}
                  className={`form-select ${errors.budgetRange ? 'input-error' : ''}`}
                >
                  <option value="">-- Select Budget --</option>
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors.budgetRange && (
                  <span id="error-budgetRange" className="error-text" role="alert">
                    {errors.budgetRange}
                  </span>
                )}
              </div>

              <fieldset className="form-group" style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend className="form-label">
                  Desired Maturity <span className="required">*</span>
                </legend>
                <div className="radio-group">
                  {MATURITY_OPTIONS.map((opt) => (
                    <label key={opt.value} htmlFor={`maturity-${opt.value}`} className="radio-label">
                      <input
                        type="radio"
                        id={`maturity-${opt.value}`}
                        name="desiredMaturity"
                        value={opt.value}
                        checked={formData.desiredMaturity === opt.value}
                        onChange={handleChange}
                        className="radio-input"
                      />
                      <span className="radio-text">{opt.label}</span>
                    </label>
                  ))}
                </div>
                {errors.desiredMaturity && (
                  <span id="error-desiredMaturity" className="error-text" role="alert">
                    {errors.desiredMaturity}
                  </span>
                )}
              </fieldset>
            </div>

            <div className="form-group">
              <label htmlFor="additionalDetails" className="form-label">
                Additional Details / Preferred Container Size / Delivery Notes
              </label>
              <textarea
                id="additionalDetails"
                name="additionalDetails"
                rows="4"
                value={formData.additionalDetails}
                onChange={handleChange}
                placeholder="Include any specifics like variegation preferences, climate region, or urgency..."
                className="form-textarea"
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Submitting Request...
                </span>
              ) : (
                'Submit Sourcing Request'
              )}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        .sourcing-container {
          max-width: 800px;
          margin: 3rem auto;
          padding: 2.5rem;
          background-color: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 12px;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
          color: #f5e7c4;
          font-family: 'Crimson Text', serif;
        }

        .sourcing-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 1.5rem;
        }

        .sourcing-title {
          font-family: 'Cinzel', serif;
          color: #d4b06a;
          font-size: 2rem;
          margin: 0 0 0.5rem 0;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sourcing-subtitle {
          font-size: 1.05rem;
          color: #e9dcbe;
          line-height: 1.5;
          margin: 0;
          max-width: 650px;
          margin-left: auto;
          margin-right: auto;
        }

        .sourcing-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .form-label {
          font-family: 'Cinzel', serif;
          font-size: 0.9rem;
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
          background-color: #123826;
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

        .radio-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-top: 0.2rem;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.95rem;
          color: #e9dcbe;
        }

        .radio-input {
          accent-color: #d4b06a;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .submit-btn {
          width: 100%;
          padding: 1rem;
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
          margin-top: 1rem;
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
          padding: 3rem 1.5rem;
          background-color: #123826;
          border: 1px solid #d4b06a;
          border-radius: 8px;
        }

        .success-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem auto;
          background-color: rgba(212, 176, 106, 0.2);
          border: 2px solid #d4b06a;
          border-radius: 50%;
          color: #d4b06a;
          font-size: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }

        .success-title {
          font-family: 'Cinzel', serif;
          color: #d4b06a;
          font-size: 1.8rem;
          margin: 0 0 1rem 0;
          letter-spacing: 0.05em;
        }

        .success-message {
          font-size: 1.1rem;
          color: #e9dcbe;
          line-height: 1.6;
          max-width: 550px;
          margin: 0 auto 2rem auto;
        }

        .reset-btn {
          padding: 0.8rem 1.8rem;
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
          .sourcing-container {
            margin: 1.5rem 1rem;
            padding: 1.5rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .sourcing-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}

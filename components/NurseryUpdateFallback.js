import React, { useState } from 'react';

export default function NurseryUpdateFallback({ reason }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/notify-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          slug: 'nursery-update',
          name: 'Nursery Release Waitlist',
          type: 'nursery_update_waitlist'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      console.error('Waitlist submission error:', err);
      setErrorMsg('Failed to submit. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nursery-update-container">
      <div className="nursery-card">
        <div className="card-badge">Nursery Status</div>
        <h2 className="nursery-title">Gathering & Seasoning Next Release</h2>
        <p className="nursery-description">
          {reason || "Our nursery benches in St. Petersburg are currently preparing the next propagation cohort of rare tropicals, orchids, and collector specimens. Live plant releases are updated on scheduled release dates."}
        </p>

        <div className="release-schedule">
          <div className="schedule-item">
            <span className="schedule-label">Next Catalog Batch:</span>
            <span className="schedule-value">15th of Next Month (10:00 AM EST)</span>
          </div>
          <div className="schedule-item">
            <span className="schedule-label">Local Nursery Pickup:</span>
            <span className="schedule-value">By Appointment (St. Petersburg, FL)</span>
          </div>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="waitlist-form">
            <label htmlFor="waitlist-email" className="waitlist-label">
              Join First-Look Release Priority Waitlist
            </label>
            <div className="input-group">
              <input
                id="waitlist-email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
              <button type="submit" disabled={loading} className="submit-btn">
                {loading ? 'Joining...' : 'Notify Me'}
              </button>
            </div>
            {errorMsg && <p className="error-text">{errorMsg}</p>}
          </form>
        ) : (
          <div className="success-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span>You&apos;re on the priority waitlist! We&apos;ll notify you the instant new specimens drop.</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .nursery-update-container {
          width: 100%;
          max-width: 780px;
          margin: 3rem auto;
          padding: 0 1rem;
          box-sizing: border-box;
          font-family: 'Crimson Text', serif;
        }
        .nursery-card {
          background: #00301E;
          border: 1px solid #D4B06A;
          border-radius: 12px;
          padding: 2.5rem 2rem;
          text-align: center;
          color: #F5E7C4;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
          position: relative;
        }
        .card-badge {
          display: inline-block;
          background: rgba(212, 176, 106, 0.15);
          color: #D4B06A;
          border: 1px solid #D4B06A;
          padding: 0.25rem 0.85rem;
          border-radius: 20px;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
          font-family: 'Cinzel', serif;
        }
        .nursery-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.8rem;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .nursery-description {
          font-size: 1.15rem;
          line-height: 1.6;
          max-width: 620px;
          margin: 0 auto 1.8rem auto;
          color: #E9DCBE;
        }
        .release-schedule {
          background: rgba(28, 61, 46, 0.6);
          border: 1px solid rgba(212, 176, 106, 0.3);
          border-radius: 8px;
          padding: 1rem 1.5rem;
          max-width: 540px;
          margin: 0 auto 2rem auto;
          text-align: left;
        }
        .schedule-item {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          font-size: 1.05rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.15);
        }
        .schedule-item:last-child {
          border-bottom: none;
        }
        .schedule-label {
          color: #D4B06A;
          font-weight: bold;
        }
        .schedule-value {
          color: #F5E7C4;
        }
        .waitlist-form {
          max-width: 520px;
          margin: 0 auto;
        }
        .waitlist-label {
          display: block;
          font-size: 1.1rem;
          color: #D4B06A;
          margin-bottom: 0.6rem;
          font-weight: bold;
        }
        .input-group {
          display: flex;
          gap: 0.5rem;
        }
        .input-group input {
          flex: 1;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          border: 1px solid #D4B06A;
          background: #F5E7C4;
          color: #00301E;
          font-size: 1rem;
          font-family: 'Crimson Text', serif;
        }
        .submit-btn {
          background: #D4B06A;
          color: #00301E;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: bold;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .submit-btn:hover {
          background: #e9dcbe;
        }
        .error-text {
          color: #ff6b6b;
          margin-top: 0.5rem;
          font-size: 0.95rem;
        }
        .success-message {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          color: #D4B06A;
          font-size: 1.1rem;
          max-width: 520px;
          margin: 0 auto;
          background: rgba(212, 176, 106, 0.1);
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #D4B06A;
        }
        @media (max-width: 600px) {
          .input-group {
            flex-direction: column;
          }
          .schedule-item {
            flex-direction: column;
            gap: 0.2rem;
          }
        }
      `}</style>
    </div>
  );
}

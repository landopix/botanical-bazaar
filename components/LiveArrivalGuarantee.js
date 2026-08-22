import React from 'react';
import Link from 'next/link';

export default function LiveArrivalGuarantee() {
  return (
    <div className="guarantee-card">
      <div className="card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <path d="m9 12 2 2 4-4"></path>
        </svg>
        <h3 className="card-title">Live-Arrival &amp; Establishment Guarantee</h3>
      </div>

      <p className="guarantee-intro">
        We guarantee that all botanical specimens arrive healthy, hydrated, and ready to thrive. If your plant suffers transit damage or severe stress:
      </p>

      <div className="claim-steps">
        <div className="step-item">
          <span className="step-num">1</span>
          <div className="step-content">
            <strong>48-Hour Claim Window:</strong> Notify our nursery team within 48 hours of carrier delivery timestamp or local pickup.
          </div>
        </div>

        <div className="step-item">
          <span className="step-num">2</span>
          <div className="step-content">
            <strong>Photo Submission:</strong> Submit clear photos showing the specimen, root ball/soil line, and packaging to info@thebotanicalbazaar.com.
          </div>
        </div>

        <div className="step-item">
          <span className="step-num">3</span>
          <div className="step-content">
            <strong>Guaranteed Remedy:</strong> Free replacement dispatch or store credit issued promptly upon claim approval.
          </div>
        </div>
      </div>

      <div className="card-footer">
        <Link href="/returns" className="returns-link">
          Read Full Claim Instructions &amp; Guarantee Terms &rarr;
        </Link>
      </div>

      <style jsx>{`
        .guarantee-card {
          background: #1C3D2E;
          border: 1px solid #D4B06A;
          border-radius: 10px;
          padding: 1.25rem;
          margin: 1rem 0;
          color: #F5E7C4;
          font-family: 'Crimson Text', serif;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.8rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 0.5rem;
        }
        .card-icon {
          flex-shrink: 0;
        }
        .card-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.15rem;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .guarantee-intro {
          font-size: 1rem;
          line-height: 1.5;
          color: #E9DCBE;
          margin-bottom: 1rem;
        }
        .claim-steps {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 1rem;
        }
        .step-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(0, 48, 30, 0.5);
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          border-left: 3px solid #D4B06A;
        }
        .step-num {
          background: #D4B06A;
          color: #00301E;
          font-family: 'Cinzel', serif;
          font-weight: bold;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          flex-shrink: 0;
        }
        .step-content {
          font-size: 0.95rem;
          color: #F5E7C4;
        }
        .card-footer {
          text-align: right;
          font-size: 0.95rem;
        }
        .card-footer :global(.returns-link) {
          color: #D4B06A;
          text-decoration: underline;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

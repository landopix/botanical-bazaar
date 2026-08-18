import React from 'react';
import Link from 'next/link';
import { checkAgRestrictions, checkWeatherHoldStatus } from '../lib/fulfillment';

export default function FulfillmentCard({ product, userZoneTemp }) {
  const agCheck = checkAgRestrictions(product);
  const weatherCheck = checkWeatherHoldStatus(userZoneTemp);

  return (
    <div className="fulfillment-card">
      <div className="card-header">
        <span className="card-icon">🌿</span>
        <h3 className="card-title">Fulfillment &amp; Dispatch Guidance</h3>
      </div>

      <div className="fulfillment-options">
        <div className="option-item">
          <div className="option-title">📍 St. Petersburg Nursery Pickup</div>
          <div className="option-desc">Free ($0.00) local pickup available by appointment at our St. Pete nursery benched facility.</div>
        </div>

        <div className="option-item">
          <div className="option-title">📦 Florida &amp; Out-of-State Shipping</div>
          <div className="option-desc">Secure live-plant shipping with custom botanical crating. Standard dispatch within 2–4 business days.</div>
        </div>
      </div>

      {agCheck.isRestricted && (
        <div className="warning-box ag-warning">
          <div className="warning-badge">{agCheck.badge}</div>
          <div className="warning-title">{agCheck.title}</div>
          <p className="warning-text">{agCheck.message}</p>
        </div>
      )}

      {weatherCheck.status !== 'NORMAL' && (
        <div className={`warning-box weather-warning ${weatherCheck.status.toLowerCase()}`}>
          <div className="warning-badge">{weatherCheck.badge}</div>
          <p className="warning-text">{weatherCheck.message}</p>
        </div>
      )}

      <div className="card-footer">
        <Link href="/shipping-pickup" className="policy-link">
          Read Full Shipping &amp; Pickup Policy &rarr;
        </Link>
      </div>

      <style jsx>{`
        .fulfillment-card {
          background: #1C3D2E;
          border: 1px solid #D4B06A;
          border-radius: 10px;
          padding: 1.25rem;
          margin: 1.5rem 0;
          color: #F5E7C4;
          font-family: 'Crimson Text', serif;
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 0.5rem;
        }
        .card-icon {
          font-size: 1.2rem;
        }
        .card-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.15rem;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .fulfillment-options {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
          margin-bottom: 1rem;
        }
        .option-item {
          background: rgba(0, 48, 30, 0.4);
          padding: 0.75rem 0.9rem;
          border-radius: 6px;
          border-left: 3px solid #D4B06A;
        }
        .option-title {
          font-weight: bold;
          color: #D4B06A;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }
        .option-desc {
          font-size: 0.95rem;
          color: #E9DCBE;
          line-height: 1.4;
        }
        .warning-box {
          background: rgba(186, 47, 47, 0.15);
          border: 1px solid #ba2f2f;
          border-radius: 6px;
          padding: 0.85rem;
          margin-bottom: 1rem;
        }
        .warning-box.ag-warning {
          border-color: #D4B06A;
          background: rgba(212, 176, 106, 0.12);
        }
        .warning-badge {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 0.75rem;
          background: #D4B06A;
          color: #00301E;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
          font-weight: bold;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
        }
        .warning-title {
          font-weight: bold;
          color: #D4B06A;
          font-size: 1rem;
          margin-bottom: 0.2rem;
        }
        .warning-text {
          margin: 0;
          font-size: 0.95rem;
          color: #F5E7C4;
          line-height: 1.4;
        }
        .card-footer {
          text-align: right;
          font-size: 0.95rem;
        }
        .card-footer :global(.policy-link) {
          color: #D4B06A;
          text-decoration: underline;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

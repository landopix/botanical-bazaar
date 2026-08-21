import React from 'react';

export default function WhatYouWillReceiveCard({ product }) {
  if (!product) return null;

  const potSize = product.custom?.pot_size || product.sizes || '4" Nursery Pot';
  const heightRange = product.height_range || '6 - 12 inches (varies by specimen)';
  const bloomStatus = product.bloom_status || 'Active foliage / Seasonal bloomer';
  const dormancyStatus = product.dormancy_status || 'Active nursery growth phase';

  return (
    <div className="receive-card">
      <div className="card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
        <h3 className="card-title">What You Will Receive</h3>
      </div>

      <div className="specs-grid">
        <div className="spec-item">
          <span className="spec-label">Container Pot Size:</span>
          <span className="spec-value">{potSize}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Approx. Plant Height:</span>
          <span className="spec-value">{heightRange}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Current Bloom Status:</span>
          <span className="spec-value">{bloomStatus}</span>
        </div>
        <div className="spec-item">
          <span className="spec-label">Growth &amp; Dormancy:</span>
          <span className="spec-value">{dormancyStatus}</span>
        </div>
      </div>

      <div className="photo-disclosure">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="disclosure-icon">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <p className="disclosure-text">
          <strong>Representative Photo Disclosure:</strong> You will receive a healthy specimen similar in size, form, and fullness to the featured botanical photography. Each plant is unique and individually grown on our St. Petersburg benches.
        </p>
      </div>

      <style jsx>{`
        .receive-card {
          background: #00301E;
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
          margin-bottom: 1rem;
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
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .spec-item {
          background: rgba(28, 61, 46, 0.6);
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          border: 1px solid rgba(212, 176, 106, 0.2);
          display: flex;
          flex-direction: column;
        }
        .spec-label {
          font-size: 0.85rem;
          color: #D4B06A;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .spec-value {
          font-size: 1rem;
          color: #F5E7C4;
          margin-top: 2px;
        }
        .photo-disclosure {
          display: flex;
          gap: 0.6rem;
          background: rgba(212, 176, 106, 0.1);
          border: 1px dashed rgba(212, 176, 106, 0.4);
          padding: 0.75rem;
          border-radius: 6px;
          align-items: flex-start;
        }
        .disclosure-icon {
          flex-shrink: 0;
          margin-top: 2px;
        }
        .disclosure-text {
          margin: 0;
          font-size: 0.95rem;
          color: #E9DCBE;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}

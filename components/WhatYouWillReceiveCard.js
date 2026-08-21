import React, { useState } from 'react';

export default function WhatYouWillReceiveCard({ product, selectedVariant }) {
  const [showTooltip, setShowTooltip] = useState(false);

  if (!product) return null;

  // Dynamic Pot Size Mapping
  let potSize = null;
  if (selectedVariant && selectedVariant.title && selectedVariant.title !== 'Default Title') {
    potSize = selectedVariant.title;
  } else if (product.custom?.pot_size) {
    potSize = product.custom.pot_size;
  } else if (product.sizes) {
    potSize = product.sizes;
  }

  const heightRange = product.height_range || product.custom?.height_range || '6 - 12 inches (varies by specimen)';
  const bloomStatus = product.custom?.bloom_status || product.bloom_status || null;
  const dormancyStatus = product.custom?.growth_dormancy || product.growth_dormancy || null;

  return (
    <div className="receive-card">
      <div className="card-header">
        <div className="header-title-container">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
          <h3 className="card-title">What You Will Receive</h3>
        </div>

        <div className="tooltip-container" onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)}>
          <button
            type="button"
            className="camera-btn"
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label="Representative Photo Disclosure"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          </button>
          {showTooltip && (
            <div className="photo-popover" role="tooltip">
              <p className="popover-text">
                <strong>Representative Photo Disclosure:</strong> You will receive a healthy specimen similar in size, form, and fullness to the featured botanical photography. Each plant is unique and individually grown on our St. Petersburg benches.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="specs-grid">
        {potSize && (
          <div className="spec-item">
            <span className="spec-label">Container Pot Size:</span>
            <span className="spec-value">{potSize}</span>
          </div>
        )}
        {heightRange && (
          <div className="spec-item">
            <span className="spec-label">Approx. Plant Height:</span>
            <span className="spec-value">{heightRange}</span>
          </div>
        )}
        {bloomStatus && (
          <div className="spec-item">
            <span className="spec-label">Current Bloom Status:</span>
            <span className="spec-value">{bloomStatus}</span>
          </div>
        )}
        {dormancyStatus && (
          <div className="spec-item">
            <span className="spec-label">Growth &amp; Dormancy:</span>
            <span className="spec-value">{dormancyStatus}</span>
          </div>
        )}
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
          justify-content: space-between;
          margin-bottom: 1rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 0.5rem;
          position: relative;
        }
        .header-title-container {
          display: flex;
          align-items: center;
          gap: 0.6rem;
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
        .tooltip-container {
          position: relative;
          display: inline-block;
        }
        .camera-btn {
          background: none;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 50%;
          transition: background-color 0.2s, transform 0.2s;
        }
        .camera-btn:hover {
          background-color: rgba(212, 176, 106, 0.15);
          transform: scale(1.08);
        }
        .photo-popover {
          position: absolute;
          right: 0;
          top: 100%;
          margin-top: 8px;
          width: 280px;
          background: #1C3D2E;
          border: 1px solid #D4B06A;
          border-radius: 8px;
          padding: 0.75rem 0.9rem;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
          z-index: 20;
        }
        .popover-text {
          margin: 0;
          font-size: 0.88rem;
          color: #F5E7C4;
          line-height: 1.4;
        }
        .specs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
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
      `}</style>
    </div>
  );
}

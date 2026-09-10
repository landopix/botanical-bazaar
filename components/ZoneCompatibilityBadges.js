import React, { useState } from 'react';

import { getPlantZoneGuidance } from '../lib/zoneGuidance';

export default function ZoneCompatibilityBadges({ product, userZone = '10a' }) {
  const [showMicroclimateModal, setShowMicroclimateModal] = useState(false);

  if (!product) return null;


  const guidance = getPlantZoneGuidance(product, userZone);
  const { badgeLabel, badgeColor } = guidance;
  const textColor = badgeColor === '#D4B06A' ? '#00301E' : '#FFFFFF';

  return (
    <div className="zone-badges-container" aria-live="polite" aria-atomic="true">
      <div className="badges-header">
        <span className="header-label">USDA Zone Compatibility (Zone {userZone}):</span>
        <button
          onClick={() => setShowMicroclimateModal(true)}
          className="microclimate-btn"
          type="button"
        >
          Microclimate Tip
        </button>
      </div>

      <div className="active-badge-status">
        <span className="badge-pill" style={{ background: badgeColor, color: textColor }}>
          {badgeLabel}
        </span>
      </div>

      {/* Zone Guidance Box */}
      <div className="zone-guidance-box">
        <h4 className="advisory-title">{guidance.title}</h4>
        <p className="advisory-note">{guidance.note}</p>
      </div>

      {showMicroclimateModal && (
        <div className="modal-overlay" onClick={() => setShowMicroclimateModal(false)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Zone {userZone} Microclimate Guidance</h3>
              <button onClick={() => setShowMicroclimateModal(false)} className="close-btn">✕</button>
            </div>
            <div className="modal-body">
              <p><strong>{guidance.title}</strong></p>
              <p>{guidance.note}</p>
              <p>Check your local forecast: sheltered walls, wind exposure, elevation, and frost pockets can make your garden warmer or colder than the regional zone.</p>
              <p>Container roots are more exposed than roots in the ground. Use this plant’s temperature guidance when deciding whether to move or protect it.</p>            </div>
            <button onClick={() => setShowMicroclimateModal(false)} className="modal-close-btn">
              Got It
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .zone-badges-container {
          background: #1C3D2E;
          border: 1px solid #D4B06A;
          border-radius: 8px;
          padding: 1rem;
          margin: 1.2rem 0;
          font-family: 'Crimson Text', serif;
          color: #F5E7C4;
        }
        .badges-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.6rem;
        }
        .header-label {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 0.95rem;
          font-weight: bold;
        }
        .microclimate-btn {
          background: none;
          border: none;
          color: #D4B06A;
          text-decoration: underline;
          cursor: pointer;
          font-size: 0.85rem;
          font-family: 'Crimson Text', serif;
        }
        .active-badge-status {
          margin-bottom: 0.6rem;
        }
        .badge-pill {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          font-weight: bold;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          text-transform: uppercase;
        }
        .zone-guidance-box {
          background-color: #00301E;
          border: 1px solid #D4B06A;
          border-radius: 6px;
          padding: 0.85rem 1rem;
          color: #D4B06A;
          margin-top: 0.5rem;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
        }
        .advisory-title {
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          font-weight: bold;
          margin: 0 0 0.35rem 0;
          color: #D4B06A;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .advisory-note {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.45;
          color: #F5E7C4;
          font-weight: 500;
        }
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
        }
        .modal-card {
          background: #00301E;
          border: 1px solid #D4B06A;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          padding: 1.5rem;
          color: #F5E7C4;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(212, 176, 106, 0.3);
          padding-bottom: 0.6rem;
          margin-bottom: 1rem;
        }
        .modal-header h3 {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          margin: 0;
          font-size: 1.2rem;
        }
        .close-btn {
          background: none;
          border: none;
          color: #D4B06A;
          font-size: 1.2rem;
          cursor: pointer;
        }
        .modal-body {
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.2rem;
        }
        .modal-body ul {
          padding-left: 1.2rem;
          margin: 0.5rem 0;
        }
        .modal-body li {
          margin-bottom: 0.4rem;
        }
        .modal-close-btn {
          width: 100%;
          background: #D4B06A;
          color: #00301E;
          border: none;
          padding: 0.6rem;
          border-radius: 20px;
          font-weight: bold;
          font-family: 'Cinzel', serif;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

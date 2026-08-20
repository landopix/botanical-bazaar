import React, { useState } from 'react';

export default function ZoneCompatibilityBadges({ product, userZone = '10a' }) {
  const [showMicroclimateModal, setShowMicroclimateModal] = useState(false);

  if (!product) return null;

  const zones = Array.isArray(product.zones) ? product.zones.map(z => z.toLowerCase().trim()) : [];
  const userZoneClean = userZone.toLowerCase().trim();

  const userNum = parseFloat(userZoneClean);

  let matchStatus = 'SEASONAL'; // 'GOOD_FIT', 'SEASONAL', 'NOT_RECOMMENDED'
  let badgeLabel = 'Seasonal / Protected Culture';
  let badgeColor = '#D4B06A';
  let badgeDesc = `Suitable outdoors in warm months or with container protection during Zone ${userZone} cold snaps.`;

  if (zones.length > 0) {
    const isDirectMatch = zones.includes(userZoneClean) || zones.some(z => z.replace(/[a-b]/g, '') === userZoneClean.replace(/[a-b]/g, ''));

    if (isDirectMatch) {
      matchStatus = 'GOOD_FIT';
      badgeLabel = 'Good Fit for Outdoors';
      badgeColor = '#249160';
      badgeDesc = `This specimen is well-adapted for outdoor growth in USDA Zone ${userZone}.`;
    } else {
      const minZone = Math.min(...zones.map(z => parseFloat(z)).filter(n => !isNaN(n)));
      if (!isNaN(minZone) && userNum < minZone) {
        matchStatus = 'NOT_RECOMMENDED';
        badgeLabel = 'Not Recommended Outdoors';
        badgeColor = '#ba2f2f';
        badgeDesc = `Zone ${userZone} experiences cold extremes below this plant's outdoor threshold. Grow indoors or in a heated greenhouse.`;
      }
    }
  }

  return (
    <div className="zone-badges-container">
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

      <div className="active-badge" style={{ borderColor: badgeColor, background: 'rgba(0,48,30,0.6)' }}>
        <span className="badge-pill" style={{ background: badgeColor, color: badgeColor === '#D4B06A' ? '#00301E' : '#FFFFFF' }}>
          {badgeLabel}
        </span>
        <p className="badge-desc">{badgeDesc}</p>
      </div>

      {showMicroclimateModal && (
        <div className="modal-overlay" onClick={() => setShowMicroclimateModal(false)} role="dialog" aria-modal="true">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>St. Petersburg Microclimate Guidance</h3>
              <button onClick={() => setShowMicroclimateModal(false)} className="close-btn">✕</button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Coastal Buffering vs Inland Frost:</strong> Microclimates across St. Petersburg and Tampa Bay vary significantly based on proximity to Tampa Bay and the Gulf of Mexico.
              </p>
              <ul>
                <li><strong>Coastal / Urban Core (Zone 10a/10b):</strong> Enjoys thermal buffering from surrounding water, protecting tropicals during mild cold snaps.</li>
                <li><strong>Inland / North County (Zone 9b):</strong> Radiational cooling on clear winter nights can cause localized frost pockets requiring temporary fabric covers or patio movement.</li>
              </ul>
              <p>
                <strong>Tip:</strong> Container plants can easily be shifted under covered lanais or indoors when night forecasts drop below 45°F.
              </p>
            </div>
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
        .active-badge {
          border-left: 4px solid;
          padding: 0.75rem;
          border-radius: 6px;
        }
        .badge-pill {
          display: inline-block;
          font-family: 'Cinzel', serif;
          font-size: 0.8rem;
          font-weight: bold;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          margin-bottom: 0.4rem;
          text-transform: uppercase;
        }
        .badge-desc {
          margin: 0;
          font-size: 0.95rem;
          color: #E9DCBE;
          line-height: 1.4;
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

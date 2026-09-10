import React, { useState } from 'react';

function getZoneGuidance(userZone) {
  const userZoneClean = (userZone || '10a').toLowerCase().trim();
  const userNum = parseFloat(userZoneClean);

  if (isNaN(userNum)) {
    return {
      title: 'USDA Zone Guidance',
      note: 'Climate adjustments may be required based on local weather extremes and seasonal temperature shifts.'
    };
  }

  // Warm Zones (10a–13)
  if (userNum >= 10) {
    if (userZoneClean === '10a') {
      return {
        title: 'Zone 10a USDA Zone Guidance',
        note: 'Thrives outdoors with year-round growth in mild-winter climates. Manage intense sun and heat in peak summer, and provide temporary microclimate protection or frost cover during rare cold snaps.'
      };
    }
    return {
      title: `Zone ${userZone.toUpperCase()} Outdoor Success Guidance`,
      note: 'Focus on year-round outdoor success in warm sub-tropical environments with intense sun/heat management and temporary microclimate protection during rare cold snaps.'
    };
  }

  // Moderate/Subtropical Zones (8–9)
  if (userNum >= 8) {
    return {
      title: `Zone ${userZone.toUpperCase()} Subtropical Patio & Container Guidance`,
      note: 'Thrives outdoors in patio or container plantings during warmer months. Bring indoors or provide substantial thermal shelter during freezing winter nights.'
    };
  }

  // Cold Zones (3–7)
  if (userNum >= 3) {
    return {
      title: `Zone ${userZone.toUpperCase()} Summer Outdoor & Overwintering Guidance`,
      note: 'Makes a wonderful outdoor potted feature during summer months, but must be brought indoors before the first fall frost to overwinter safely.'
    };
  }

  // Fallback
  return {
    title: `Zone ${userZone.toUpperCase()} Planting Guidance`,
    note: 'Climate adjustments may be required based on local weather extremes, microclimates, and seasonal temperature swings.'
  };
}

export default function ZoneCompatibilityBadges({ product, userZone = '10a' }) {
  const [showMicroclimateModal, setShowMicroclimateModal] = useState(false);

  if (!product) return null;

  const zones = Array.isArray(product.zones) ? product.zones.map(z => z.toLowerCase().trim()) : [];
  const userZoneClean = (userZone || '10a').toLowerCase().trim();
  const userNum = parseFloat(userZoneClean);

  const guidance = getZoneGuidance(userZone);

  let matchStatus = 'SEASONAL'; // 'GOOD_FIT', 'SEASONAL'
  let badgeLabel = `Zone ${userZone.toUpperCase()} Guidance`;
  let badgeColor = '#B8533C';
  let textColor = '#FFFFFF';

  if (zones.length > 0) {
    const isDirectMatch = zones.includes(userZoneClean) || zones.some(z => z.replace(/[a-b]/g, '') === userZoneClean.replace(/[a-b]/g, ''));

    if (isDirectMatch) {
      matchStatus = 'GOOD_FIT';
      badgeLabel = 'Good Fit for Outdoors';
      badgeColor = '#249160';
      textColor = '#FFFFFF';
    } else {
      matchStatus = 'SEASONAL';
      badgeLabel = 'Seasonal / Protected Culture';
      badgeColor = '#B8533C';
      textColor = '#FFFFFF';
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
              {userNum >= 10 ? (
                <>
                  <p>
                    <strong>Coastal Buffering & Sub-Tropical Protection (Zone {userZone}):</strong> Regional microclimates vary significantly based on urban heat islands and proximity to coastal waters.
                  </p>
                  <ul>
                    <li><strong>Coastal / Urban Zones (10a/10b):</strong> Enjoys thermal buffering from surrounding bodies of water, keeping winter temperatures mild.</li>
                    <li><strong>Inland Microclimates:</strong> Radiational cooling on clear winter nights can cause localized frost pockets requiring temporary fabric covers or patio movement.</li>
                  </ul>
                  <p>
                    <strong>Tip:</strong> Move potted container plants under covered lanais or indoors when night forecasts drop below 45°F.
                  </p>
                </>
              ) : userNum >= 8 ? (
                <>
                  <p>
                    <strong>Sub-Tropical & Moderate Hardiness Guidance (Zone {userZone}):</strong> Microclimates in Zone {userZone} experience occasional winter freeze events and frost risk.
                  </p>
                  <ul>
                    <li><strong>Outdoor Beds:</strong> Mulch heavily around root bases and utilize frost cloth during winter freeze advisories.</li>
                    <li><strong>Patio & Container Cultivation:</strong> Tropicals thrive outdoors during spring through autumn but require indoor protection when temperatures approach freezing.</li>
                  </ul>
                  <p>
                    <strong>Tip:</strong> Bring tender potted specimens indoors before night temperatures drop below 45°F–50°F.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>Cold Climate & Overwintering Protection (Zone {userZone}):</strong> Outdoor winter temperatures in Zone {userZone} fall below tropical plant survival thresholds.
                  </p>
                  <ul>
                    <li><strong>Indoor Culture:</strong> Maintain tropical plants as houseplants in bright indirect light or grow under supplemental LED lights during winter.</li>
                    <li><strong>Summer Patio Season:</strong> Shift containers outdoors after the last spring frost date once ambient temperatures consistently exceed 55°F.</li>
                  </ul>
                  <p>
                    <strong>Tip:</strong> Always bring potted specimens indoors before the first autumn freeze in Zone {userZone}.
                  </p>
                </>
              )}
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

import React from 'react';
import Link from 'next/link';

export default function CareSpine({ product }) {
  if (!product) return null;

  const tags = Array.isArray(product.tags) ? product.tags.map(t => t.toLowerCase()) : [];

  let light = 'Bright Indirect Sunlight';
  if (tags.includes('full-sun')) light = 'Full Sun (6+ hrs daily)';
  else if (tags.includes('low-light')) light = 'Low to Moderate Filtered Light';

  let water = 'Water when top 1–2 inches dry';
  if (tags.includes('drought-tolerant')) water = 'Allow soil to dry thoroughly between waterings';
  else if (tags.includes('high-humidity')) water = 'Keep consistently moist, never waterlogged';

  let humidity = '50%–70% (Standard Household to Tropical)';
  if (tags.includes('high-humidity')) humidity = '65%+ High Ambient Humidity Required';

  const potSize = product.custom?.pot_size || product.sizes || 'Standard Nursery Pot';
  const coldHardiness = product.temp_threshold ? `Hardy down to ${product.temp_threshold}°F` : 'Protect below 50°F';

  return (
    <div className="care-spine-card">
      <div className="card-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="card-icon">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.4 19 2c1 2 2 4.1 2 7 0 4.4-3.6 8-8 8Z"></path>
          <path d="M12 20v-8"></path>
        </svg>
        <h3 className="card-title">Care Spine Quick Guide</h3>
        <Link href="/almanac" className="almanac-link">
          Explore Almanac &rarr;
        </Link>
      </div>

      <div className="care-grid">
        <div className="care-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="care-icon">
            <circle cx="12" cy="12" r="4"></circle>
            <path d="M12 2v2"></path>
            <path d="M12 20v2"></path>
            <path d="m4.93 4.93 1.41 1.41"></path>
            <path d="m17.66 17.66 1.41 1.41"></path>
            <path d="M2 12h2"></path>
            <path d="M20 12h2"></path>
            <path d="m6.34 17.66-1.41 1.41"></path>
            <path d="m19.07 4.93-1.41 1.41"></path>
          </svg>
          <div className="care-meta">
            <span className="care-label">Light Requirements</span>
            <span className="care-val">{light}</span>
          </div>
        </div>

        <div className="care-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="care-icon">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
          <div className="care-meta">
            <span className="care-label">Watering Frequency</span>
            <span className="care-val">{water}</span>
          </div>
        </div>

        <div className="care-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="care-icon">
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
            <path d="M12 11c1.5 1.5 2 2.5 2 4"></path>
          </svg>
          <div className="care-meta">
            <span className="care-label">Humidity Level</span>
            <span className="care-val">{humidity}</span>
          </div>
        </div>

        <div className="care-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="care-icon">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"></path>
            <path d="m3.3 7 8.7 5 8.7-5"></path>
            <path d="M12 22V12"></path>
          </svg>
          <div className="care-meta">
            <span className="care-label">Container Pot Size</span>
            <span className="care-val">{potSize}</span>
          </div>
        </div>

        <div className="care-item">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="care-icon">
            <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
          </svg>
          <div className="care-meta">
            <span className="care-label">Cold Tolerance</span>
            <span className="care-val">{coldHardiness}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .care-spine-card {
          background: #00301E;
          border: 1px solid #D4B06A;
          border-radius: 10px;
          padding: 1.2rem;
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
        .card-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.15rem;
          margin: 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          flex: 1;
        }
        .care-spine-card :global(.almanac-link) {
          color: #D4B06A;
          text-decoration: underline;
          font-size: 0.9rem;
          font-weight: bold;
        }
        .care-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.8rem;
        }
        .care-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(28, 61, 46, 0.6);
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          border: 1px solid rgba(212, 176, 106, 0.2);
        }
        .care-icon {
          flex-shrink: 0;
        }
        .care-meta {
          display: flex;
          flex-direction: column;
        }
        .care-label {
          font-size: 0.8rem;
          color: #D4B06A;
          font-weight: bold;
          text-transform: uppercase;
        }
        .care-val {
          font-size: 0.95rem;
          color: #F5E7C4;
        }
      `}</style>
    </div>
  );
}

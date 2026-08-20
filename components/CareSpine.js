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

        <h3 className="card-title">Care Spine Quick Guide</h3>
        <Link href="/almanac" className="almanac-link">
          Explore Almanac &rarr;
        </Link>
      </div>

      <div className="care-grid">
        <div className="care-item">

          <div className="care-meta">
            <span className="care-label">Light Requirements</span>
            <span className="care-val">{light}</span>
          </div>
        </div>

        <div className="care-item">

          <div className="care-meta">
            <span className="care-label">Watering Frequency</span>
            <span className="care-val">{water}</span>
          </div>
        </div>

        <div className="care-item">

          <div className="care-meta">
            <span className="care-label">Humidity Level</span>
            <span className="care-val">{humidity}</span>
          </div>
        </div>

        <div className="care-item">

          <div className="care-meta">
            <span className="care-label">Container Pot Size</span>
            <span className="care-val">{potSize}</span>
          </div>
        </div>

        <div className="care-item">

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
          gap: 0.6rem;
          background: rgba(28, 61, 46, 0.6);
          padding: 0.6rem 0.8rem;
          border-radius: 6px;
          border: 1px solid rgba(212, 176, 106, 0.2);
        }
        .care-icon {
          font-size: 1.2rem;
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

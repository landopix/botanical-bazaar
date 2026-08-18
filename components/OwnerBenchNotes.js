import React from 'react';

export default function OwnerBenchNotes({ notes }) {
  const defaultNotes = "In our St. Petersburg nursery benches, this cultivar responds exceptionally well to coarse orchid bark and pumice aeration. During summer humidity surges, ensure strong air circulation. Protect from winter cold snaps below 50°F by bringing containers under covered patio lanais.";

  return (
    <div className="bench-notes-card">
      <div className="card-header">
        <span className="card-icon">📝</span>
        <h3 className="card-title">From Our Benches (St. Pete Grower Notes)</h3>
      </div>
      <p className="notes-body">
        &ldquo;{notes || defaultNotes}&rdquo;
      </p>
      <div className="notes-signature">
        — The Botanical Bazaar Nursery Team, St. Petersburg FL
      </div>

      <style jsx>{`
        .bench-notes-card {
          background: rgba(212, 176, 106, 0.08);
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
          margin-bottom: 0.75rem;
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
        .notes-body {
          font-size: 1.05rem;
          line-height: 1.6;
          color: #E9DCBE;
          font-style: italic;
          margin: 0 0 0.8rem 0;
        }
        .notes-signature {
          font-size: 0.85rem;
          color: #D4B06A;
          text-align: right;
          font-weight: bold;
          font-family: 'Cinzel', serif;
        }
      `}</style>
    </div>
  );
}

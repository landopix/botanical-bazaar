import React from 'react';

export default function SeasonalArchive({ title, children }) {
  return (
    <div className="seasonal-archive-container">
      <div className="archive-header">
        <span className="archive-badge">Past Seasonal Archive</span>
        <h3 className="archive-title">{title || "Past Seasonal Content"}</h3>
        <p className="archive-note">
          Notice: Active seasonal entries for the current period have concluded or are being updated by our growers. Below is our archived collection for historical reference.
        </p>
      </div>
      <div className="archive-content">
        {children}
      </div>

      <style jsx>{`
        .seasonal-archive-container {
          background: rgba(0, 48, 30, 0.4);
          border: 1px dashed #D4B06A;
          border-radius: 12px;
          padding: 2rem;
          margin: 2rem 0;
          color: #E9DCBE;
          font-family: 'Crimson Text', serif;
        }
        .archive-header {
          text-align: center;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(212, 176, 106, 0.3);
          padding-bottom: 1rem;
        }
        .archive-badge {
          display: inline-block;
          background: rgba(212, 176, 106, 0.15);
          color: #D4B06A;
          border: 1px solid #D4B06A;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-family: 'Cinzel', serif;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.8rem;
        }
        .archive-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.8rem;
          margin: 0 0 0.5rem 0;
        }
        .archive-note {
          font-size: 1rem;
          color: #E9DCBE;
          font-style: italic;
          max-width: 650px;
          margin: 0 auto;
          line-height: 1.5;
        }
        .archive-content {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
}

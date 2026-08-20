import React from 'react';

export default function CareSheetSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#123826',
        borderRadius: '12px',
        border: '1px solid rgba(212, 176, 106, 0.3)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        boxSizing: 'border-box'
      }}
      className="animate-pulse"
      aria-label="Loading care sheet..."
    >
      {/* 4:3 Aspect Ratio Image Skeleton */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '75%', // 4:3 aspect ratio
          backgroundColor: '#1C3D2E',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(212,176,106,0.05) 0%, rgba(212,176,106,0.18) 50%, rgba(212,176,106,0.05) 100%)'
          }}
        />
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Title and Botanical Subtitle */}
          <div style={{ height: '1.3rem', backgroundColor: 'rgba(212, 176, 106, 0.28)', borderRadius: '4px', marginBottom: '0.5rem', width: '75%' }} />
          <div style={{ height: '0.95rem', backgroundColor: 'rgba(245, 231, 196, 0.2)', borderRadius: '4px', marginBottom: '1rem', width: '50%' }} />

          {/* Care Specs Box */}
          <div style={{ backgroundColor: '#00301E', padding: '0.8rem', borderRadius: '6px', marginBottom: '1rem', border: '1px solid rgba(212, 176, 106, 0.2)' }}>
            <div style={{ height: '0.85rem', backgroundColor: 'rgba(212, 176, 106, 0.2)', borderRadius: '4px', marginBottom: '0.4rem', width: '80%' }} />
            <div style={{ height: '0.85rem', backgroundColor: 'rgba(212, 176, 106, 0.2)', borderRadius: '4px', marginBottom: '0.4rem', width: '85%' }} />
            <div style={{ height: '0.85rem', backgroundColor: 'rgba(212, 176, 106, 0.2)', borderRadius: '4px', width: '70%' }} />
          </div>

          {/* Description Paragraph (3 lines) */}
          <div style={{ height: '0.9rem', backgroundColor: 'rgba(233, 220, 190, 0.18)', borderRadius: '4px', marginBottom: '0.4rem', width: '100%' }} />
          <div style={{ height: '0.9rem', backgroundColor: 'rgba(233, 220, 190, 0.18)', borderRadius: '4px', marginBottom: '0.4rem', width: '95%' }} />
          <div style={{ height: '0.9rem', backgroundColor: 'rgba(233, 220, 190, 0.18)', borderRadius: '4px', marginBottom: '1.2rem', width: '60%' }} />
        </div>

        {/* Action Button Skeleton */}
        <div style={{ height: '38px', backgroundColor: 'rgba(212, 176, 106, 0.2)', border: '1px solid rgba(212, 176, 106, 0.4)', borderRadius: '24px', width: '100%' }} />
      </div>
    </div>
  );
}

import React from 'react';

export default function GalleryItemSkeleton() {
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
      aria-label="Loading gallery item..."
    >
      {/* 4:3 Aspect Ratio Image Container */}
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
        {/* Category Pill Skeleton */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            width: '110px',
            height: '24px',
            backgroundColor: 'rgba(0, 48, 30, 0.85)',
            border: '1px solid rgba(212, 176, 106, 0.3)',
            borderRadius: '12px'
          }}
        />
      </div>

      <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Title */}
          <div style={{ height: '1.15rem', backgroundColor: 'rgba(212, 176, 106, 0.3)', borderRadius: '4px', marginBottom: '0.5rem', width: '80%' }} />
          {/* Description (3 lines) */}
          <div style={{ height: '0.9rem', backgroundColor: 'rgba(245, 231, 196, 0.15)', borderRadius: '4px', marginBottom: '0.3rem', width: '100%' }} />
          <div style={{ height: '0.9rem', backgroundColor: 'rgba(245, 231, 196, 0.15)', borderRadius: '4px', marginBottom: '0.3rem', width: '90%' }} />
          <div style={{ height: '0.9rem', backgroundColor: 'rgba(245, 231, 196, 0.15)', borderRadius: '4px', width: '65%' }} />
        </div>

        {/* View photo CTA link indicator */}
        <div style={{ marginTop: '1rem', height: '0.9rem', width: '120px', backgroundColor: 'rgba(212, 176, 106, 0.25)', borderRadius: '4px' }} />
      </div>
    </div>
  );
}

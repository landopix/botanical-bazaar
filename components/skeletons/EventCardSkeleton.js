import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#123826',
        borderRadius: '12px',
        border: '1px solid rgba(212, 176, 106, 0.3)',
        padding: '1.8rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.8rem',
        boxSizing: 'border-box'
      }}
      className="animate-pulse"
      aria-label="Loading event..."
    >
      {/* 16:9 Aspect Ratio Image Skeleton */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%', // 16:9 aspect ratio
          backgroundColor: '#1C3D2E',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '0.5rem'
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

      {/* Header & Date Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ height: '1.4rem', backgroundColor: 'rgba(212, 176, 106, 0.3)', borderRadius: '4px', width: '60%' }} />
        <div style={{ height: '1.4rem', backgroundColor: 'rgba(0, 48, 30, 0.8)', border: '1px solid rgba(212, 176, 106, 0.3)', borderRadius: '20px', width: '30%' }} />
      </div>

      {/* Location */}
      <div style={{ height: '0.95rem', backgroundColor: 'rgba(245, 231, 196, 0.2)', borderRadius: '4px', width: '45%' }} />

      {/* Description Lines (3 lines) */}
      <div style={{ height: '1rem', backgroundColor: 'rgba(233, 220, 190, 0.15)', borderRadius: '4px', width: '100%' }} />
      <div style={{ height: '1rem', backgroundColor: 'rgba(233, 220, 190, 0.15)', borderRadius: '4px', width: '92%' }} />
      <div style={{ height: '1rem', backgroundColor: 'rgba(233, 220, 190, 0.15)', borderRadius: '4px', width: '70%' }} />

      {/* RSVP Button Skeleton */}
      <div style={{ marginTop: '0.5rem', alignSelf: 'flex-start' }}>
        <div style={{ height: '38px', width: '150px', backgroundColor: 'rgba(212, 176, 106, 0.25)', border: '1px solid rgba(212, 176, 106, 0.4)', borderRadius: '24px' }} />
      </div>
    </div>
  );
}

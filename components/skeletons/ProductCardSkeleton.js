import React from 'react';

export default function ProductCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: '#123826',
        border: '1px solid rgba(212, 176, 106, 0.3)',
        borderRadius: '10px',
        padding: '1.2rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        boxSizing: 'border-box'
      }}
      className="animate-pulse"
      aria-label="Loading product..."
    >
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1 }}>
        {/* Aspect Ratio 1:1 Image Container Skeleton */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '100%', // 1:1 aspect ratio
            backgroundColor: '#1C3D2E',
            borderRadius: '8px',
            marginBottom: '0.8rem',
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

        {/* Title Lines */}
        <div style={{ height: '1.1rem', backgroundColor: 'rgba(212, 176, 106, 0.25)', borderRadius: '4px', marginBottom: '0.4rem', width: '85%', alignSelf: 'center' }} />
        <div style={{ height: '1.1rem', backgroundColor: 'rgba(212, 176, 106, 0.2)', borderRadius: '4px', marginBottom: '0.8rem', width: '60%', alignSelf: 'center' }} />

        {/* Pot / Size Badge Line */}
        <div style={{ height: '0.9rem', backgroundColor: 'rgba(245, 231, 196, 0.15)', borderRadius: '4px', marginBottom: '0.4rem', width: '50%', alignSelf: 'center' }} />

        {/* Price Line */}
        <div style={{ height: '1rem', backgroundColor: 'rgba(212, 176, 106, 0.3)', borderRadius: '4px', margin: '0.4rem auto', width: '40%' }} />
      </div>

      {/* Button Skeleton */}
      <div style={{ width: '100%', marginTop: 'auto', paddingTop: '0.6rem' }}>
        <div style={{ height: '38px', backgroundColor: 'rgba(212, 176, 106, 0.2)', border: '1px solid rgba(212, 176, 106, 0.4)', borderRadius: '18px', width: '100%' }} />
      </div>
    </div>
  );
}

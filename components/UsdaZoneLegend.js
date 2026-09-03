import React from 'react';

const ZONES = [
  { zone: 'Zone 1', temp: '-60 to -50°F', bg: '#5D2A85', text: '#FFFFFF' },
  { zone: 'Zone 2', temp: '-50 to -40°F', bg: '#4C2982', text: '#FFFFFF' },
  { zone: 'Zone 3', temp: '-40 to -30°F', bg: '#6845A3', text: '#FFFFFF' },
  { zone: 'Zone 4', temp: '-30 to -20°F', bg: '#2A5A9E', text: '#FFFFFF' },
  { zone: 'Zone 5', temp: '-20 to -10°F', bg: '#3D78BA', text: '#FFFFFF' },
  { zone: 'Zone 6', temp: '-10 to 0°F', bg: '#1D6E35', text: '#FFFFFF' },
  { zone: 'Zone 7', temp: '0 to 10°F', bg: '#6CA844', text: '#00301E' },
  { zone: 'Zone 8', temp: '10 to 20°F', bg: '#ABCD49', text: '#00301E' },
  { zone: 'Zone 9', temp: '20 to 30°F', bg: '#F4D35E', text: '#00301E' },
  { zone: 'Zone 10', temp: '30 to 40°F', bg: '#ECA141', text: '#00301E' },
  { zone: 'Zone 11', temp: '40 to 50°F', bg: '#D97334', text: '#FFFFFF' },
  { zone: 'Zone 12', temp: '50 to 60°F', bg: '#E84F36', text: '#FFFFFF' },
  { zone: 'Zone 13', temp: '60 to 70°F', bg: '#D3302E', text: '#FFFFFF' },
];

export default function UsdaZoneLegend() {
  return (
    <div
      style={{
        background: '#123826',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid #D4B06A',
        marginTop: '1.25rem',
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
      }}
    >
      <h3
        style={{
          color: '#D4B06A',
          fontFamily: 'Cinzel, serif',
          fontSize: '1.1rem',
          textAlign: 'center',
          marginTop: 0,
          marginBottom: '1rem',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        USDA Hardiness Zones Legend
      </h3>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.65rem',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
      >
        {ZONES.map((item) => (
          <div
            key={item.zone}
            style={{
              backgroundColor: item.bg,
              color: item.text,
              padding: '0.55rem 0.85rem',
              borderRadius: '8px',
              flex: '1 1 120px',
              maxWidth: '180px',
              minWidth: '100px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <span
              style={{
                fontWeight: '700',
                fontSize: '0.95rem',
                lineHeight: '1.2',
                letterSpacing: '0.02em',
              }}
            >
              {item.zone}
            </span>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: '600',
                marginTop: '0.2rem',
                lineHeight: '1.2',
                whiteSpace: 'nowrap',
              }}
            >
              {item.temp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

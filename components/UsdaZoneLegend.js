import React from 'react';

const ZONES = [
  { zone: 'Zone 1', temp: '-60 to -50°F', bg: '#4A6984', text: '#FFFFFF' },
  { zone: 'Zone 2', temp: '-50 to -40°F', bg: '#4182A4', text: '#FFFFFF' },
  { zone: 'Zone 3', temp: '-40 to -30°F', bg: '#42A5B3', text: '#FFFFFF' },
  { zone: 'Zone 4', temp: '-30 to -20°F', bg: '#47B881', text: '#FFFFFF' },
  { zone: 'Zone 5', temp: '-20 to -10°F', bg: '#62C265', text: '#111111' },
  { zone: 'Zone 6', temp: '-10 to 0°F', bg: '#91CF50', text: '#111111' },
  { zone: 'Zone 7', temp: '0 to 10°F', bg: '#C5DF51', text: '#111111' },
  { zone: 'Zone 8', temp: '10 to 20°F', bg: '#F8E84E', text: '#111111' },
  { zone: 'Zone 9', temp: '20 to 30°F', bg: '#F6B445', text: '#111111' },
  { zone: 'Zone 10', temp: '30 to 40°F', bg: '#EF7138', text: '#FFFFFF' },
  { zone: 'Zone 11', temp: '40 to 50°F', bg: '#E23D38', text: '#FFFFFF' },
  { zone: 'Zone 12', temp: '50 to 60°F', bg: '#B32857', text: '#FFFFFF' },
  { zone: 'Zone 13', temp: '60 to 70°F', bg: '#7E1C55', text: '#FFFFFF' },
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
              padding: '0.5rem 0.85rem',
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
                fontSize: '0.9rem',
                lineHeight: '1.2',
                letterSpacing: '0.02em',
              }}
            >
              {item.zone}
            </span>
            <span
              style={{
                fontSize: '0.78rem',
                opacity: 0.95,
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

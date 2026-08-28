import React from 'react';
import Image from 'next/image';
import Button from './Button';
import { isOptimizedCdnUrl } from '../lib/image-utils';

export default function CareSheetCard({
  sheet = {},
  titleClamp = 2,
  descClamp = 3,
  className = ''
}) {
  const commonName = sheet?.commonName ?? sheet?.title ?? 'Botanical Specimen';
  const botanicalName = sheet?.botanicalName ?? sheet?.scientificName ?? '';
  const lightNeeds = sheet?.lightNeeds ?? sheet?.light ?? 'Bright Indirect Light';
  const wateringNeeds = sheet?.wateringNeeds ?? sheet?.water ?? 'Moderate';
  const zoneCompatibility = sheet?.zoneCompatibility ?? sheet?.zones ?? 'Zones 9b - 11';
  const careInstructions = sheet?.careInstructions ?? sheet?.description ?? 'Provide proper air circulation, well-draining soil, and indirect light.';
  const rawImage = sheet?.imageUrl ?? sheet?.imagePath ?? sheet?.image;
  const imageSrc = rawImage
    ? (rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
    : '/assets/placeholder.png';

  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  return (
    <div
      className={`care-sheet-card flex flex-col justify-between h-full bg-[#1C3D2E] rounded-xl border border-[#D4B06A] overflow-hidden shadow-md ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: '#1C3D2E',
        borderRadius: '12px',
        border: '1px solid #D4B06A',
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}
    >
      <div>
        {/* Aspect Ratio 4:3 Image Container Wrapper */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '75%', // 4:3 aspect ratio
            overflow: 'hidden',
            backgroundColor: '#001F14'
          }}
        >
          <Image
            src={imageSrc}
            alt={commonName || botanicalName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: 'cover'
            }}
            unoptimized={!isLocalOrAllowedCdn(imageSrc)}
            onError={(e) => {
              if (e.target) e.target.src = '/assets/placeholder.png';
            }}
          />
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          <h3
            className={`line-clamp-${titleClamp}`}
            style={{
              color: '#D4B06A',
              margin: '0 0 0.2rem 0',
              fontFamily: 'Cinzel, serif',
              fontSize: '1.3rem',
              display: '-webkit-box',
              WebkitLineClamp: titleClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {commonName}
          </h3>

          {botanicalName && (
            <p
              className="line-clamp-1"
              style={{
                color: '#F5E7C4',
                fontStyle: 'italic',
                margin: '0 0 1rem 0',
                fontSize: '0.95rem',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}
            >
              {botanicalName}
            </p>
          )}

          <div
            style={{
              background: '#00301E',
              padding: '0.8rem',
              borderRadius: '6px',
              fontSize: '0.88rem',
              marginBottom: '1rem',
              border: '1px solid #2d5a44'
            }}
          >
            <p style={{ margin: '0 0 0.3rem 0' }}><strong style={{ color: '#D4B06A' }}>Light:</strong> {lightNeeds}</p>
            <p style={{ margin: '0 0 0.3rem 0' }}><strong style={{ color: '#D4B06A' }}>Watering:</strong> {wateringNeeds}</p>
            <p style={{ margin: 0 }}><strong style={{ color: '#D4B06A' }}>USDA Zones:</strong> {zoneCompatibility}</p>
          </div>

          <p
            className={`line-clamp-${descClamp}`}
            style={{
              fontSize: '0.92rem',
              lineHeight: '1.5',
              margin: '0 0 1.2rem 0',
              color: '#E9DCBE',
              display: '-webkit-box',
              WebkitLineClamp: descClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {careInstructions}
          </p>
        </div>
      </div>

      <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', marginTop: 'auto' }}>
        <Button variant="outline" href="/shop" style={{ width: '100%' }}>Find Plants</Button>
      </div>
    </div>
  );
}

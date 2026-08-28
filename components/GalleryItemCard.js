import React from 'react';
import Image from 'next/image';
import { isOptimizedCdnUrl } from '../lib/image-utils';

const CATEGORY_MAP = {
  'collector-orchids': 'Collector Orchids',
  'tropical-fruit-trees': 'Tropical Fruit Trees',
  'herbs-medicinal': 'Herbs & Medicinal',
  'rare-aroids': 'Rare Aroids',
  'apothecary-goods': 'Apothecary Goods',
};

export default function GalleryItemCard({
  item = {},
  onClick,
  titleClamp = 2,
  descClamp = 3,
  className = ''
}) {
  const title = item?.title ?? 'Botanical Highlight';
  const description = item?.description ?? 'A featured tropical specimen from our St. Petersburg nursery.';
  const category = item?.category;
  const displayCategory = item?.categoryLabel || (category ? CATEGORY_MAP[category] || category : null);
  const rawImage = item?.imageUrl ?? item?.image;
  const imageSrc = rawImage
    ? (rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
    : '/assets/placeholder.png';
  const alt = item?.alt || title;

  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  return (
    <div
      onClick={onClick}
      className={`gallery-card flex flex-col justify-between h-full bg-[#1C3D2E] rounded-xl border border-[#D4B06A] overflow-hidden cursor-pointer shadow-md transition-all ${className}`}
      style={{
        background: '#1C3D2E',
        borderRadius: '12px',
        border: '1px solid #D4B06A',
        overflow: 'hidden',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
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
            alt={alt}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{
              objectFit: 'cover',
              transition: 'transform 0.4s ease'
            }}
            className="gallery-img"
            unoptimized={!isLocalOrAllowedCdn(imageSrc)}
            onError={(e) => {
              if (e.target) e.target.src = '/assets/placeholder.png';
            }}
          />

          {displayCategory && (
            <span
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'rgba(0, 48, 30, 0.85)',
                color: '#D4B06A',
                border: '1px solid #D4B06A',
                borderRadius: '12px',
                padding: '0.2rem 0.7rem',
                fontSize: '0.75rem',
                fontFamily: 'Cinzel, serif',
                textTransform: 'uppercase',
                backdropFilter: 'blur(4px)',
                zIndex: 2
              }}
            >
              {displayCategory}
            </span>
          )}
        </div>

        <div style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column' }}>
          <h3
            className={`line-clamp-${titleClamp}`}
            style={{
              color: '#D4B06A',
              fontFamily: 'Cinzel, serif',
              fontSize: '1.15rem',
              marginTop: 0,
              marginBottom: '0.5rem',
              display: '-webkit-box',
              WebkitLineClamp: titleClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </h3>

          <p
            className={`line-clamp-${descClamp}`}
            style={{
              color: '#F5E7C4',
              fontSize: '0.95rem',
              lineHeight: '1.5',
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: descClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <div style={{ padding: '0 1.2rem 1.2rem 1.2rem', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#D4B06A', fontSize: '0.85rem', fontFamily: 'Cinzel, serif', fontWeight: 'bold' }}>
          <span>Click to view photo</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import Image from 'next/image';
import Button from './Button';
import { isOptimizedCdnUrl } from '../lib/image-utils';

export default function EventCard({
  event = {},
  titleClamp = 2,
  descClamp = 3,
  className = ''
}) {
  const title = event?.title ?? 'Botanical Workshop';
  const formattedDate = event?.formattedDate ?? event?.dateTime ?? 'TBA';
  const location = event?.location ?? 'St. Petersburg, FL';
  const description = event?.description ?? 'Join us for a hands-on botanical workshop at our nursery garden.';
  const ticketUrl = event?.ticketUrl;
  const rawImage = event?.imageUrl ?? event?.image;
  const imageSrc = rawImage
    ? (rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
    : null;

  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  return (
    <div
      className={`event-card flex flex-col justify-between h-full bg-[#1C3D2E] rounded-xl border border-[#D4B06A] p-7 gap-3 overflow-hidden shadow-md ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: '#1C3D2E',
        borderRadius: '12px',
        border: '1px solid #D4B06A',
        padding: '1.8rem',
        gap: '0.8rem',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', flexGrow: 1 }}>
        {/* Aspect Ratio 16:9 Image Wrapper Skeleton / Image Container */}
        {imageSrc && (
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '56.25%', // 16:9 aspect ratio
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#001F14',
              marginBottom: '0.5rem'
            }}
          >
            <Image
              src={imageSrc}
              alt={title}
              width={1200}
              height={675}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{
                objectFit: 'cover', position: 'absolute', inset: 0, width: '100%', height: '100%'
              }}
              unoptimized={!isLocalOrAllowedCdn(imageSrc)}
              onError={(e) => {
                if (e.target) e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h3
            className={`line-clamp-${titleClamp}`}
            style={{
              color: '#D4B06A',
              margin: 0,
              fontFamily: 'Cinzel, serif',
              fontSize: '1.4rem',
              display: '-webkit-box',
              WebkitLineClamp: titleClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {title}
          </h3>
          <span
            style={{
              background: '#00301E',
              color: '#D4B06A',
              border: '1px solid #D4B06A',
              padding: '0.3rem 0.8rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap'
            }}
          >
            {formattedDate}
          </span>
        </div>

        <p style={{ margin: 0, fontSize: '0.95rem', color: '#F5E7C4', fontWeight: 'bold' }}>
          {location}
        </p>

        <p
          className={`line-clamp-${descClamp}`}
          style={{
            margin: 0,
            lineHeight: '1.6',
            fontSize: '1rem',
            color: '#E9DCBE',
            display: '-webkit-box',
            WebkitLineClamp: descClamp,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {description}
        </p>
      </div>

      <div style={{ marginTop: '0.8rem', alignSelf: 'flex-start' }}>
        {ticketUrl ? (
          <Button variant="gold-filled" href={ticketUrl}>RSVP &amp; Tickets</Button>
        ) : (
          <span style={{ fontSize: '0.9rem', fontStyle: 'italic', color: '#D4B06A' }}>
            Free Community Event — No Ticket Required
          </span>
        )}
      </div>
    </div>
  );
}

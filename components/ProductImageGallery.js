import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { isSanityCdnUrl } from '../lib/image-utils';

export default function ProductImageGallery({ images = [], alt = 'Product Image' }) {
  const galleryImages = Array.isArray(images) && images.length > 0
    ? images
    : ['/assets/placeholder.png'];

  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? galleryImages.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 40;
    const isRightSwipe = distance < -40;

    if (isLeftSwipe && galleryImages.length > 1) {
      handleNext();
    } else if (isRightSwipe && galleryImages.length > 1) {
      handlePrev();
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const activeImage = galleryImages[currentIndex] || '/assets/placeholder.png';
  const hasMultiple = galleryImages.length > 1;

  return (
    <div className="product-gallery-container">
      <div
        className="product-gallery-main"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={activeImage}
          alt={`${alt} - Image ${currentIndex + 1}`}
          fill
          sizes="(max-width: 800px) 100vw, 400px"
          style={{ objectFit: 'cover', borderRadius: '14px', background: '#e9dcbe11' }}
          priority={currentIndex === 0}
          unoptimized={!isSanityCdnUrl(activeImage)}
        />

        {hasMultiple && (
          <>
            <button
              onClick={handlePrev}
              className="gallery-nav-btn nav-prev"
              aria-label="Previous image"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="gallery-nav-btn nav-next"
              aria-label="Next image"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
            <div className="gallery-indicator">
              {currentIndex + 1} / {galleryImages.length}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="gallery-thumbnails">
          {galleryImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`thumbnail-btn ${idx === currentIndex ? 'active' : ''}`}
              aria-label={`View image ${idx + 1}`}
              type="button"
            >
              <div className="thumbnail-img-wrapper">
                <Image
                  src={img}
                  alt={`${alt} thumbnail ${idx + 1}`}
                  fill
                  sizes="60px"
                  style={{ objectFit: 'cover', borderRadius: '6px' }}
                  unoptimized={!isSanityCdnUrl(img)}
                />
              </div>
            </button>
          ))}
        </div>
      )}

      <style jsx>{`
        .product-gallery-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        .product-gallery-main {
          position: relative;
          width: 100%;
          height: 360px;
          border-radius: 14px;
          overflow: hidden;
          background: #1C3D2E;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          user-select: none;
        }
        .gallery-nav-btn {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(0, 48, 30, 0.85);
          border: 1px solid #D4B06A;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 2;
          transition: background 0.2s, transform 0.2s;
        }
        .gallery-nav-btn:hover {
          background: #00301E;
          transform: translateY(-50%) scale(1.08);
        }
        .nav-prev {
          left: 10px;
        }
        .nav-next {
          right: 10px;
        }
        .gallery-indicator {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0, 48, 30, 0.85);
          color: #D4B06A;
          border: 1px solid rgba(212, 176, 106, 0.5);
          font-size: 0.8rem;
          font-weight: bold;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          z-index: 2;
        }
        .gallery-thumbnails {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          padding-bottom: 0.3rem;
          scrollbar-width: thin;
          scrollbar-color: #D4B06A #00301E;
        }
        .thumbnail-btn {
          background: none;
          border: 2px solid transparent;
          border-radius: 8px;
          padding: 2px;
          cursor: pointer;
          flex: 0 0 auto;
          transition: border-color 0.2s, transform 0.2s;
        }
        .thumbnail-btn.active {
          border-color: #D4B06A;
        }
        .thumbnail-btn:hover {
          border-color: #E9DCBE;
        }
        .thumbnail-img-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
          border-radius: 6px;
          overflow: hidden;
        }
        @media (max-width: 800px) {
          .product-gallery-main {
            height: 300px;
          }
        }
      `}</style>
    </div>
  );
}

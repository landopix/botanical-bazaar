import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isOptimizedCdnUrl, isSanityCdnUrl, optimizeCdnUrl } from '../lib/image-utils';
import { useWishlist } from '../context/WishlistContext';

export function parseProductTitle(rawTitle = '') {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return { commonName: 'Botanical Specimen', scientificName: '' };
  }

  const match = rawTitle.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    return {
      commonName: match[1].trim(),
      scientificName: match[2].trim()
    };
  }

  return {
    commonName: rawTitle.trim(),
    scientificName: ''
  };
}

export function getLowestAvailableVariant(product = {}) {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length === 0) return null;

  const inStockVariants = variants.filter(v => {
    if (!v) return false;
    const isAvail = v.availableForSale ?? true;
    const qty = v.quantityAvailable ?? v.quantity ?? 10;
    return isAvail && qty > 0;
  });

  const pool = inStockVariants.length > 0 ? inStockVariants : variants;

  return pool.reduce((lowest, curr) => {
    if (!lowest) return curr;
    const lowestPrice = typeof lowest.price === 'number' ? lowest.price : parseFloat(lowest.price || 0);
    const currPrice = typeof curr.price === 'number' ? curr.price : parseFloat(curr.price || 0);
    return currPrice < lowestPrice ? curr : lowest;
  }, null);
}

export function getResolvedPotSize(product = {}) {
  if (product?.custom?.pot_size) return product.custom.pot_size;
  if (product?.potSize) return product.potSize;

  const lowestVariant = getLowestAvailableVariant(product);
  if (lowestVariant?.title && lowestVariant.title !== 'Default Title') {
    return lowestVariant.title;
  }

  const tags = Array.isArray(product?.tags) ? product.tags : [];
  const sizeTag = tags.find(t =>
    typeof t === 'string' && (t.toLowerCase().includes('pot') || t.toLowerCase().includes('gal'))
  );
  if (sizeTag) return sizeTag;

  return 'Standard Pot';
}

export function getResolvedPlantType(product = {}) {
  if (product?.custom?.plant_type) return product.custom.plant_type;
  if (product?.plantType) return product.plantType;

  const rawType = product?.type || product?.productType || product?.category;
  if (rawType && rawType !== 'Plant' && rawType !== 'Default') {
    return rawType;
  }

  const tags = Array.isArray(product?.tags) ? product.tags.map(t => t.toLowerCase()) : [];
  if (tags.includes('orchid') || tags.includes('orchids')) return 'Orchid';
  if (tags.includes('aroid') || tags.includes('aroids')) return 'Aroid';
  if (tags.includes('fruit-tree') || tags.includes('fruit tree') || tags.includes('fruit')) return 'Fruit Tree';
  if (tags.includes('exotic') || tags.includes('rare')) return 'Exotic & Rare';
  if (tags.includes('herb') || tags.includes('medicinal')) return 'Herb & Medicinal';
  if (tags.includes('houseplant')) return 'Tropical Houseplant';

  return 'Tropical Plant';
}

function ProductCard({
  product = {},
  titleClamp = 2,
  descClamp = 3,
  className = ''
}) {
  const { wishlist, toggleWishlist } = useWishlist();

  const slug = product?.slug?.current || product?.slug || '';
  const rawName = product?.name ?? product?.title ?? 'Botanical Specimen';
  const { commonName, scientificName } = parseProductTitle(rawName);

  const lowestVariant = getLowestAvailableVariant(product);
  const price = lowestVariant ? (typeof lowestVariant.price === "number" ? lowestVariant.price : parseFloat(lowestVariant.price)) : product?.price;
  const compareAtPrice = lowestVariant?.compareAtPrice ? (typeof lowestVariant.compareAtPrice === "number" ? lowestVariant.compareAtPrice : parseFloat(lowestVariant.compareAtPrice)) : (product?.compareAtPrice ? (typeof product.compareAtPrice === "number" ? product.compareAtPrice : parseFloat(product.compareAtPrice)) : null);

  const hasDiscount = compareAtPrice && price && compareAtPrice > price;
  const discountAmount = hasDiscount ? compareAtPrice - price : 0;
  const discountPercent = hasDiscount ? Math.round((discountAmount / compareAtPrice) * 100) : 0;

  const quantity = product?.quantity ?? 10;
  const isSoldOut = product?.availableForSale === false || (typeof quantity === 'number' && quantity < 1);
  const rawImage = product?.image ?? product?.imageUrl ?? product?.featuredImage?.url;
  const imageSrc = rawImage
    ? optimizeCdnUrl(rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
    : '/assets/placeholder.png';

  const extractedSize = getResolvedPotSize(product);
  const type = getResolvedPlantType(product);

  const isWishlisted = Array.isArray(wishlist) && wishlist.some(item => (item?.slug?.current || item?.slug) === slug);

  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist(product);
    }
  };

  return (
    <div
      className={`product-card flex flex-col justify-between h-full bg-[#F5E7C4] border border-[#D4B06A] rounded-xl overflow-hidden shadow-md relative ${
        isSoldOut ? 'opacity-60' : ''
      } ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        backgroundColor: '#F5E7C4',
        border: '1px solid #D4B06A',
        borderRadius: '12px',
        overflow: 'hidden',
        position: 'relative',
        boxSizing: 'border-box'
      }}
    >
      {/* Badges container */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {isSoldOut ? (
          <div
            className="sold-out-badge"
            style={{
              background: '#ba2f2f',
              color: '#ffffff',
              padding: '0.2rem 0.6rem',
              borderRadius: '4px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}
          >
            Sold Out
          </div>
        ) : (
          <>
            {hasDiscount && (
              <div
                className="sale-badge"
                style={{
                  background: '#11402A',
                  color: '#D4B06A',
                  border: '1px solid #D4B06A',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {discountPercent > 0 ? `${discountPercent}% OFF` : 'SALE'}
              </div>
            )}
            {(quantity === 1 || quantity === 2) && (
              <div
                className="low-stock-badge"
                style={{
                  background: '#D4B06A',
                  color: '#00301E',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold'
                }}
              >
                {`Only ${quantity} Left!`}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Wishlist Heart Trigger */}
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-pressed={isWishlisted}
        aria-label={isWishlisted ? `Remove ${commonName} from Wishlist` : `Save ${commonName} to Wishlist`}
        title={isWishlisted ? "In Wishlist Sanctuary" : "Add to Wishlist"}
        className={`wishlist-btn-toggle ${isWishlisted ? "is-active" : ""}`}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 15,
          background: 'rgba(0, 48, 30, 0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          border: '1px solid #D4B06A',
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isWishlisted ? "#D4B06A" : "none"}
          stroke="#D4B06A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1, padding: '1.2rem 1.2rem 0 1.2rem' }}>
        <Link
          href={slug ? `/product/${slug}` : '/shop'}
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          {/* Aspect Square (1:1) Image Wrapper */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              paddingTop: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              backgroundColor: '#1C3D2E',
              marginBottom: '0.8rem'
            }}
          >
            <Image
              src={imageSrc}
              alt={commonName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover', width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
              unoptimized={!isLocalOrAllowedCdn(imageSrc)}
              onError={(e) => {
                if (e.target) e.target.src = '/assets/placeholder.png';
              }}
            />
          </div>

          <strong
            className={`line-clamp-${titleClamp}`}
            style={{
              display: '-webkit-box',
              WebkitLineClamp: titleClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              fontSize: '1.2rem',
              fontFamily: 'Cinzel, serif',
              lineHeight: '1.3',
              color: '#00301E',
              textAlign: 'center'
            }}
          >
            {commonName}
          </strong>
          {scientificName && (
            <span
              style={{
                display: 'block',
                fontSize: '0.88rem',
                fontStyle: 'italic',
                fontFamily: 'Crimson Text, serif',
                color: '#11402A',
                textAlign: 'center',
                marginTop: '0.2rem'
              }}
            >
              ({scientificName})
            </span>
          )}
        </Link>

        <p style={{ margin: '0.5rem 0 0.1rem 0', fontSize: '0.9rem', color: '#00301E', textAlign: 'center', fontWeight: '500' }}>
          Size: {extractedSize} &bull; Type: {type}
        </p>

        <div style={{ margin: '0.4rem 0 0.8rem 0', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {isSoldOut ? (
            <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#ba2f2f' }}>Sold Out</span>
          ) : (
            <>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#11402A' }}>
                {typeof price === 'number' ? `$${price.toFixed(2)}` : price ?? 'Price on Request'}
              </span>
              {hasDiscount && (
                <span style={{ textDecoration: 'line-through', fontSize: '0.95rem', color: '#7f8c8d' }}>
                  ${compareAtPrice.toFixed(2)}
                </span>
              )}
            </>
          )}
        </div>
      </div>

      <div style={{ width: '100%', padding: '0 1.2rem 1.2rem 1.2rem', marginTop: 'auto' }}>
        <Link
          href={slug ? `/product/${slug}` : '/shop'}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'center',
            padding: '0.5rem 1.2rem',
            borderRadius: '18px',
            background: '#00301E',
            color: '#F5E7C4',
            border: '1px solid #D4B06A',
            fontWeight: 'bold',
            fontSize: '0.95rem',
            textDecoration: 'none',
            boxSizing: 'border-box'
          }}
        >
          View Plant
        </Link>
      </div>
      <style jsx>{`
        .wishlist-btn-toggle {
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
        }
        .wishlist-btn-toggle:hover {
          transform: scale(1.12);
          background-color: rgba(0, 48, 30, 0.95) !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4) !important;
        }
        .wishlist-btn-toggle:active {
          transform: scale(0.92);
        }
        .wishlist-btn-toggle svg {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .wishlist-btn-toggle:hover svg {
          transform: scale(1.1);
        }
        .wishlist-btn-toggle.is-active svg {
          animation: heartPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .wishlist-btn-toggle:focus-visible {
          outline: 2px solid #D4B06A !important;
          outline-offset: 2px !important;
        }
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// Performance Optimization: Memoize ProductCard to prevent unnecessary re-renders
// during catalog filtering, searching, and sorting operations in parent components.
export default React.memo(ProductCard);

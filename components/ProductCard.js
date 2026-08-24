import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isSanityCdnUrl } from '../lib/image-utils';
import { useWishlist } from '../context/WishlistContext';
import { parseProductTitle } from '../lib/shopify';

export function getResolvedPotSize(product, selectedVariant = null) {
  const variantsToInspect = selectedVariant
    ? [selectedVariant]
    : Array.isArray(product?.variants)
    ? product.variants
    : [];

  for (const variant of variantsToInspect) {
    if (variant?.selectedOptions && Array.isArray(variant.selectedOptions)) {
      const sizeOpt = variant.selectedOptions.find(
        opt => {
          const optName = opt?.name?.toLowerCase() || "";
          return optName === "pot size" || optName === "size" || optName === "container" || optName === "pot";
        }
      );
      if (sizeOpt?.value && sizeOpt.value !== "Default Title") return sizeOpt.value;
    }
    if (variant?.title && variant.title !== "Default Title") {
      return variant.title;
    }
  }

  if (Array.isArray(product?.options)) {
    const sizeOptGroup = product.options.find(
      opt => {
        const optName = opt?.name?.toLowerCase() || "";
        return optName === "pot size" || optName === "size" || optName === "container";
      }
    );
    if (sizeOptGroup?.values?.[0]) return sizeOptGroup.values[0];
  }

  if (product?.custom?.pot_size) return product.custom.pot_size;
  if (product?.sizes && typeof product.sizes === "string") {
    const cleanSizes = product.sizes.split("|")[0].trim();
    if (cleanSizes && cleanSizes !== "Default Title") return cleanSizes;
  }
  if (product?.potSize) return product.potSize;

  return "Standard Pot";
}

export function getResolvedPlantType(product) {
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

  const price = product?.price;
  const quantity = product?.quantity ?? 10;
  const isSoldOut = product?.availableForSale === false || (typeof quantity === 'number' && quantity < 1);
  const rawImage = product?.image ?? product?.imageUrl ?? product?.featuredImage?.url;
  const imageSrc = rawImage
    ? (rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
    : '/assets/placeholder.png';

  const extractedSize = getResolvedPotSize(product);
  const type = getResolvedPlantType(product);

  const isWishlisted = Array.isArray(wishlist) && wishlist.some(item => (item?.slug?.current || item?.slug) === slug);

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
      {isSoldOut ? (
        <div
          className="sold-out-badge"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#ba2f2f',
            color: '#ffffff',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          Sold Out
        </div>
      ) : (quantity === 1 || quantity === 2) ? (
        <div
          className="low-stock-badge"
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            background: '#D4B06A',
            color: '#00301E',
            padding: '0.2rem 0.6rem',
            borderRadius: '4px',
            fontSize: '0.8rem',
            fontWeight: 'bold',
            zIndex: 10
          }}
        >
          {`Only ${quantity} Left!`}
        </div>
      ) : null}

      {/* Floating Wishlist Heart Trigger */}
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-label={isWishlisted ? `Remove ${commonName} from Wishlist` : `Save ${commonName} to Wishlist`}
        title={isWishlisted ? "In Wishlist Sanctuary" : "Add to Wishlist"}
        className="wishlist-btn-toggle"
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
              unoptimized={!isSanityCdnUrl(imageSrc)}
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
        <p style={{ fontWeight: 'bold', margin: '0.4rem 0 0.8rem 0', fontSize: '1.1rem', color: '#11402A', textAlign: 'center' }}>
          {isSoldOut
            ? 'Sold Out'
            : typeof price === 'number'
            ? `$${price.toFixed(2)}`
            : price ?? 'Price on Request'}
        </p>
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
        .wishlist-btn-toggle:focus-visible {
          outline: 2px solid #D4B06A !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </div>
  );
}

// Performance Optimization: Memoize ProductCard to prevent unnecessary re-renders
// during catalog filtering, searching, and sorting operations in parent components.
export default React.memo(ProductCard);

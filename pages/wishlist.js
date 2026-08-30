import SEO from "../components/SEO";
import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';
import { isOptimizedCdnUrl } from '../lib/image-utils';

export default function WishlistPage() {
  const { wishlist, clearWishlist, removeFromWishlist } = useWishlist();

  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  if (!wishlist || wishlist.length === 0) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <SEO title="Wishlist Sanctuary" description="View and manage your saved tropical plant specimens and wishlisted rare collector flora." />
        <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>
          Your Wishlist Sanctuary is Empty
        </h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6', color: '#F5E7C4' }}>
          Save rare orchids, variegated monstera, and tropical fruit trees to track availability and plan your garden.
        </p>
        <Button variant="gold-filled" href="/shop">Browse Nursery Catalog</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto', color: '#F5E7C4' }}>
      <SEO title="Wishlist Sanctuary" description="View and manage your saved tropical plant specimens and wishlisted rare collector flora." />

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Wishlist Sanctuary
        </h1>
        <p style={{ color: '#E9DCBE', fontSize: '1.1rem', margin: 0 }}>
          Your saved tropical specimens and collector choices ({wishlist.length} saved)
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.8rem',
          alignItems: 'stretch',
          marginBottom: '3rem'
        }}
      >
        {wishlist.map((item, index) => {
          const slug = item?.slug?.current || item?.slug || '';
          const name = item?.name || item?.title || 'Botanical Specimen';
          const rawImage = item?.image || item?.imageUrl || item?.featuredImage?.url;
          const imageSrc = rawImage
            ? (rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
            : '/assets/placeholder.png';
          const price = typeof item?.price === 'number' ? item.price : parseFloat(item?.price || 0);
          const isSoldOut = item?.availableForSale === false || (typeof item?.quantity === 'number' && item.quantity < 1);

          return (
            <div
              key={slug || index}
              style={{
                background: '#1C3D2E',
                border: '1px solid #D4B06A',
                borderRadius: '12px',
                padding: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                position: 'relative'
              }}
            >
              <div>
                <Link href={slug ? `/product/${slug}` : '/shop'}>
                  <div
                    style={{
                      width: '100%',
                      height: '200px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      position: 'relative',
                      backgroundColor: '#123826',
                      marginBottom: '1rem'
                    }}
                  >
                    <Image
                      src={imageSrc}
                      alt={name}
                      width={800}
                      height={800}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      style={{ objectFit: 'cover', position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                      unoptimized={!isLocalOrAllowedCdn(imageSrc)}
                      onError={(e) => { if (e.target) e.target.src = '/assets/placeholder.png'; }}
                    />
                    {isSoldOut && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '8px',
                          left: '8px',
                          background: '#ba2f2f',
                          color: '#ffffff',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          zIndex: 2
                        }}
                      >
                        Sold Out
                      </div>
                    )}
                  </div>
                </Link>

                <h3
                  style={{
                    color: '#D4B06A',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '1.2rem',
                    marginTop: 0,
                    marginBottom: '0.4rem',
                    lineHeight: '1.3'
                  }}
                >
                  {name}
                </h3>

                <p style={{ color: '#E9DCBE', fontWeight: 'bold', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
                  {isSoldOut ? 'Sold Out' : (isNaN(price) || !price ? 'Price on Request' : `$${price.toFixed(2)}`)}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem', marginTop: 'auto' }}>
                <Button variant="gold-filled" href={slug ? `/product/${slug}` : '/shop'} style={{ flex: 1, textAlign: 'center' }}>
                  View Specimen
                </Button>
                <button
                  onClick={() => removeFromWishlist && removeFromWishlist(slug)}
                  title="Remove from wishlist"
                  aria-label={`Remove ${name} from wishlist`}
                  style={{
                    background: 'transparent',
                    border: '1px solid #ba2f2f',
                    color: '#ba2f2f',
                    borderRadius: '8px',
                    padding: '0.5rem 0.8rem',
                    cursor: 'pointer',
                    fontSize: '1rem'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={clearWishlist}
          style={{
            background: 'transparent',
            border: '1px solid #D4B06A',
            color: '#D4B06A',
            borderRadius: '24px',
            padding: '0.6rem 1.6rem',
            fontFamily: 'Cinzel, serif',
            cursor: 'pointer'
          }}
        >
          Clear Wishlist Sanctuary
        </button>
      </div>
    </div>
  );
}

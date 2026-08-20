import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { getAllProducts } from '../lib/shopify';

export async function getStaticProps() {
  try {
    const products = await getAllProducts();
    return {
      props: {
        products: products || [],
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error('Error fetching sales products in getStaticProps:', error);
    return {
      props: {
        products: [],
      },
      revalidate: 60,
    };
  }
}

export default function Sales({ products = [] }) {
  const { toggleWishlist, wishlist } = useWishlist();

  // Filter products on sale: compareAtPrice > price OR tagged with 'sale' / 'on-sale'
  const saleProducts = products.filter((p) => {
    const hasCompareDiscount = p.compareAtPrice && p.compareAtPrice > p.price;
    const hasSaleTag =
      Array.isArray(p.tags) &&
      p.tags.some((t) => t.toLowerCase() === 'sale' || t.toLowerCase() === 'on-sale');
    return hasCompareDiscount || hasSaleTag;
  });

  const popularProducts = products.slice(0, 4);

  return (
    <>
      <Head>
        <title>On Sale & Limited Botanical Specials | The Botanical Bazaar</title>
        <meta
          name="description"
          content="Explore limited-time seasonal offers, discount specimen batches, and rare collector plant sales at The Botanical Bazaar in St. Petersburg, FL."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/sales" />
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem', boxSizing: 'border-box' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              color: '#D4B06A',
              fontFamily: 'Cinzel, serif',
              fontSize: '2.5rem',
              letterSpacing: '0.08em',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}
          >
            Limited Botanical Specials &amp; Sales
          </h1>
          <p
            style={{
              color: '#E9DCBE',
              fontSize: '1.15rem',
              maxWidth: '680px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            Hand-selected specimen offerings, greenhouse overstock specials, and seasonal propagation discounts.
          </p>
        </div>

        {saleProducts.length === 0 ? (
          <div>
            {/* Warm Status Banner when 0 sale items exist */}
            <div
              style={{
                maxWidth: '800px',
                margin: '0 auto 3.5rem auto',
                background: '#00301E',
                border: '1px solid #D4B06A',
                padding: '3rem 2rem',
                borderRadius: '12px',
                textAlign: 'center',
                color: '#F5E7C4',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                boxSizing: 'border-box'
              }}
            >
              <h2
                style={{
                  color: '#D4B06A',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1.8rem',
                  margin: '0 0 1rem 0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}
              >
                No Active Sales Right Now – Propagation in Progress
              </h2>
              <p
                style={{
                  fontSize: '1.15rem',
                  lineHeight: '1.6',
                  maxWidth: '650px',
                  margin: '0 auto 1.8rem auto',
                  color: '#E9DCBE'
                }}
              >
                Our master growers are currently propagating our next seasonal collection. Check back soon for upcoming batch discounts, or explore our full catalog of available flora below.
              </p>
              <Button variant="gold-filled" href="/shop">
                Browse All Plants &rarr;
              </Button>
            </div>

            {/* Popular Items Row */}
            {popularProducts.length > 0 && (
              <div>
                <h3
                  style={{
                    color: '#D4B06A',
                    fontFamily: 'Cinzel, serif',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    marginBottom: '1.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}
                >
                  Featured Sanctuary Specimens
                </h3>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                    gap: '1.5rem'
                  }}
                >
                  {popularProducts.map((product) => {
                    const isSoldOut = !product.quantity || product.quantity < 3;
                    const isWishlisted = wishlist.some((item) => item.slug === product.slug);
                    const imageSrc = product.image || '/assets/placeholder.png';

                    return (
                      <div key={product.slug} className="product-card">
                        <div className="product-image-container">
                          <Image
                            src={imageSrc}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="product-image"
                            unoptimized={!imageSrc.includes('cdn.sanity.io')}
                          />
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="wishlist-heart-btn"
                            aria-label="Add to wishlist"
                            style={{
                              position: 'absolute',
                              top: '10px',
                              right: '10px',
                              background: 'rgba(0,48,30,0.8)',
                              border: '1px solid #D4B06A',
                              borderRadius: '50%',
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              zIndex: 2
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill={isWishlisted ? '#D4B06A' : 'none'}
                              stroke="#D4B06A"
                              strokeWidth="2"
                            >
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          </button>
                        </div>
                        <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                          <div>
                            <h4 style={{ fontFamily: 'Cinzel, serif', color: '#00301E', margin: '0 0 0.4rem 0', fontSize: '1.1rem' }}>
                              {product.name}
                            </h4>
                            <p style={{ color: '#1C3D2E', fontSize: '0.9rem', margin: '0 0 0.8rem 0' }}>
                              ${product.price ? product.price.toFixed(2) : 'N/A'}
                            </p>
                          </div>
                          <Link
                            href={`/product/${product.slug}`}
                            style={{
                              display: 'block',
                              textAlign: 'center',
                              background: '#00301E',
                              color: '#D4B06A',
                              border: '1px solid #D4B06A',
                              padding: '0.6rem',
                              borderRadius: '6px',
                              fontWeight: 'bold',
                              textDecoration: 'none',
                              fontSize: '0.9rem'
                            }}
                          >
                            View Plant
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '2rem'
            }}
          >
            {saleProducts.map((product) => {
              const isWishlisted = wishlist.some((item) => item.slug === product.slug);
              const imageSrc = product.image || '/assets/placeholder.png';

              return (
                <div key={product.slug} className="product-card" style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: '#ba2f2f',
                      color: '#ffffff',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      zIndex: 3,
                      fontFamily: 'Cinzel, serif',
                      letterSpacing: '0.05em'
                    }}
                  >
                    ON SALE
                  </div>
                  <div className="product-image-container">
                    <Image
                      src={imageSrc}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="product-image"
                      unoptimized={!imageSrc.includes('cdn.sanity.io')}
                    />
                    <button
                      onClick={() => toggleWishlist(product)}
                      className="wishlist-heart-btn"
                      aria-label="Add to wishlist"
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(0,48,30,0.8)',
                        border: '1px solid #D4B06A',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 2
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill={isWishlisted ? '#D4B06A' : 'none'}
                        stroke="#D4B06A"
                        strokeWidth="2"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontFamily: 'Cinzel, serif', color: '#00301E', margin: '0 0 0.4rem 0', fontSize: '1.15rem' }}>
                        {product.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.8rem' }}>
                        {product.compareAtPrice && (
                          <span style={{ color: '#ba2f2f', textDecoration: 'line-through', fontSize: '0.95rem' }}>
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                        <span style={{ color: '#00301E', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          ${product.price ? product.price.toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <Link
                      href={`/product/${product.slug}`}
                      style={{
                        display: 'block',
                        textAlign: 'center',
                        background: '#00301E',
                        color: '#D4B06A',
                        border: '1px solid #D4B06A',
                        padding: '0.6rem',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        fontSize: '0.9rem'
                      }}
                    >
                      View Plant
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

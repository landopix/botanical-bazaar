import Head from 'next/head';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const router = useRouter();
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedSlug, setAddedSlug] = useState(null);

  const handleAddToCart = (item) => {
    const slug = item?.slug?.current || item?.slug || '';
    const activePrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
    const itemToAdd = {
      ...item,
      slug,
      price: activePrice,
      variantId: item.variantId || item.variants?.[0]?.id || null
    };
    addToCart(itemToAdd, 1, item.sizes || 'Standard Pot');
    setAddedSlug(slug);
    setTimeout(() => {
      setAddedSlug(null);
    }, 2000);
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto', color: '#E9DCBE', minHeight: '60vh', fontFamily: 'Crimson Text, serif' }}>
      <Head>
        <title>Your Botanical Wishlist Sanctuary | The Botanical Bazaar</title>
        <meta name="description" content="View and manage your saved tropical plants, collector orchids, and wishlist items at The Botanical Bazaar." />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Your Wishlist Sanctuary
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.5', fontStyle: 'italic', color: '#E9DCBE' }}>
        Keep track of rare tropical specimens, collector orchids, and fruit trees for your garden collection.
      </p>

      {wishlist && wishlist.length > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #D4B06A', paddingBottom: '0.8rem', flexWrap: 'wrap', gap: '1rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>
              {wishlist.length} {wishlist.length === 1 ? 'Saved Specimen' : 'Saved Specimens'}
            </span>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all items from your Wishlist Sanctuary?')) {
                  clearWishlist();
                }
              }}
              style={{
                background: 'transparent',
                color: '#ff8a8a',
                border: '1px solid #ff8a8a',
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontFamily: 'Crimson Text, serif',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
            >
              Clear All Wishlist Items
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch',
              marginBottom: '3rem'
            }}
          >
            {wishlist.map((item) => {
              const slug = item?.slug?.current || item?.slug || '';
              const name = item?.name || item?.title || 'Botanical Specimen';
              const price = typeof item?.price === 'number' ? item.price : parseFloat(item?.price) || 0;

              let rawImage = item?.image || item?.imageUrl || item?.featuredImage?.url;
              if (Array.isArray(item?.images) && item.images.length > 0) {
                const firstImg = item.images[0];
                rawImage = typeof firstImg === 'string' ? firstImg : (firstImg?.url || firstImg?.src || rawImage);
              }
              const imageSrc = rawImage
                ? (rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
                : '/assets/placeholder.png';

              const sizes = item?.sizes || item?.potSize || item?.custom?.pot_size || 'Standard Pot';
              const isSoldOut = item?.availableForSale === false || (typeof item?.quantity === 'number' && item.quantity < 3);
              const isJustAdded = addedSlug === slug;

              return (
                <div
                  key={slug || item?.id}
                  style={{
                    backgroundColor: '#1C3D2E',
                    border: '1px solid #D4B06A',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '1.2rem',
                    position: 'relative',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                  }}
                >
                  {/* Remove Button (Top Right) */}
                  <button
                    onClick={() => removeFromWishlist(slug)}
                    aria-label={`Remove ${name} from Wishlist`}
                    title="Remove item"
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      zIndex: 10,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#ff8a8a',
                      border: '1px solid #ff8a8a',
                      borderRadius: '50%',
                      width: '28px',
                      height: '28px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      padding: 0
                    }}
                  >
                    ✕
                  </button>

                  <div>
                    {/* Image Container */}
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
                      <img
                        src={imageSrc}
                        alt={name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
                            fontWeight: 'bold'
                          }}
                        >
                          Sold Out
                        </div>
                      )}
                    </div>

                    {/* Plant Details */}
                    <h3
                      style={{
                        fontFamily: 'Cinzel, serif',
                        color: '#D4B06A',
                        fontSize: '1.2rem',
                        margin: '0 0 0.3rem 0',
                        lineHeight: '1.3'
                      }}
                    >
                      {name}
                    </h3>

                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#8DA38B' }}>
                      Size: {sizes}
                    </p>

                    <div style={{ fontSize: '1.15rem', fontWeight: 'bold', color: '#F5E7C4', marginBottom: '1.2rem' }}>
                      {isSoldOut ? (
                        <span style={{ color: '#ff8a8a' }}>Sold Out</span>
                      ) : price > 0 ? (
                        `$${price.toFixed(2)}`
                      ) : (
                        'Price on Request'
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: 'auto' }}>
                    {!isSoldOut ? (
                      <button
                        onClick={() => handleAddToCart(item)}
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          borderRadius: '20px',
                          background: isJustAdded ? '#249160' : '#D4B06A',
                          color: '#00301E',
                          border: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          fontFamily: 'Crimson Text, serif'
                        }}
                      >
                        {isJustAdded ? '✓ Added to Cart' : 'Add to Cart'}
                      </button>
                    ) : (
                      <button
                        disabled
                        style={{
                          width: '100%',
                          padding: '0.6rem 1rem',
                          borderRadius: '20px',
                          background: 'rgba(212, 176, 106, 0.2)',
                          color: '#8DA38B',
                          border: '1px solid rgba(212, 176, 106, 0.3)',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          cursor: 'not-allowed',
                          fontFamily: 'Crimson Text, serif'
                        }}
                      >
                        Temporarily Out of Stock
                      </button>
                    )}

                    <Link
                      href={slug ? `/product/${slug}` : '/shop'}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'center',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        background: 'transparent',
                        color: '#D4B06A',
                        border: '1px solid #D4B06A',
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        textDecoration: 'none',
                        boxSizing: 'border-box'
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div style={{ background: '#00301E', border: '1px solid #D4B06A', padding: '3.5rem 2rem', borderRadius: '12px', textAlign: 'center', maxWidth: '600px', margin: '2rem auto', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
          <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.8rem' }}>Your Wishlist Sanctuary is Empty</h2>
          <p style={{ margin: '1rem 0 2rem 0', fontSize: '1.1rem', lineHeight: '1.6', color: '#E9DCBE' }}>
            Explore our nursery catalog and tap the heart icon on any plant card or product page to save specimens for future reference.
          </p>
          <Button variant="gold-filled" href="/shop">Browse Nursery Catalog &rarr;</Button>
        </div>
      )}
    </div>
  );
}

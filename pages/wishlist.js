import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (wishlist.length === 0) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ color: '#D4B06A', marginBottom: '1.5rem' }}>Your Wishlist is Empty</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Save your favorite rare and resilient tropical plants to view or buy later!</p>
        <Button variant="gold-filled" href="/shop">Browse the Catalog</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', marginBottom: '2.5rem' }}>Your Botanical Wishlist</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
        {wishlist.map(product => {
          const isSoldOut = !product.quantity || product.quantity <= 0;

          return (
            <div
              key={product.slug}
              className="product-card"
              style={{
                backgroundColor: '#F5E7C4',
                borderRadius: '12px',
                padding: '1.2rem',
                color: '#1C3D2E',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                position: 'relative'
              }}
            >
              <button
                onClick={() => removeFromWishlist(product.slug)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#ba2f2f',
                  border: 'none',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  color: '#ffffff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  zIndex: 2
                }}
                title="Remove from Wishlist"
              >
                ✕
              </button>

              <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                />
                <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', minHeight: '3.2rem' }}>{product.name}</h3>
                <p style={{ margin: '0 0 1rem 0', fontWeight: 'bold' }}>
                  {isNaN(product.price) || !product.price ? 'Price on Request' : `$${product.price.toFixed(2)}`}
                </p>
              </Link>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {!isSoldOut ? (
                  <Button
                    variant="green-filled"
                    onClick={() => addToCart(product, 1)}
                    style={{ width: '100%' }}
                  >
                    Add to Cart
                  </Button>
                ) : (
                  <div style={{
                    background: '#ba2f2f',
                    color: '#ffffff',
                    padding: '0.5rem',
                    borderRadius: '24px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
                  }}>
                    Sold Out
                  </div>
                )}
                <Button variant="outline" href={`/product/${product.slug}`} style={{ width: '100%' }}>
                  View Details
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

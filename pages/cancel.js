import React from 'react';
import Button from '../components/Button';

export default function Cancel() {
  return (
    <div style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', fontSize: '3rem', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem' }}>Checkout Canceled</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
        No charges were made. Your selected rare tropical plant companion list is preserved safely in your shopping cart!
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button variant="gold-filled" href="/cart" rel="nofollow">Return to Cart</Button>
        <Button variant="outline" href="/shop">Continue Browsing</Button>
      </div>
    </div>
  );
}

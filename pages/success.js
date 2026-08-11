import React, { useEffect } from 'react';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';

export default function Success() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Empty the cart on successful local checkout
    clearCart();
  }, []);

  return (
    <div style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', fontSize: '3rem', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem' }}>🌱 Order Successful!</h1>
      <h2 style={{ color: '#F4F1E1', margin: '0 0 1rem 0' }}>Thank you for growing with us!</h2>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
        We have secured your selected tropical plant companions! Our nursery guides are preparing your collection. All sales are strictly local pickup in St. Petersburg, FL. The precise nursery location and appointment address will be provided upon inquiry or order confirmation.
      </p>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Button variant="gold-filled" href="/account">Go to Dashboard</Button>
        <Button variant="outline" href="/shop">Browse More Catalog</Button>
      </div>
    </div>
  );
}

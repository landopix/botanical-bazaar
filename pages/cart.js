import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h1 style={{ color: '#D4B06A', marginBottom: '1.5rem' }}>Your Cart is Empty</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Ready to fill your garden with rare and resilient tropical plants?</p>
        <Button variant="gold-filled" href="/shop">Browse the Catalog</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', marginBottom: '2.5rem' }}>Shopping Cart</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {cart.map((item) => (
          <div
            key={`${item.slug}-${item.selectedSize}`}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '1.5rem',
              alignItems: 'center',
              background: '#1C3D2E',
              padding: '1.5rem',
              borderRadius: '12px',
              border: '1px solid #D4B06A',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div>
                <h3 style={{ margin: '0 0 0.3rem 0', color: '#D4B06A', fontFamily: 'Georgia, serif' }}>{item.name}</h3>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: '#E9DCBE' }}>Size: {item.selectedSize || 'Default'}</p>
                <p style={{ margin: '0', fontWeight: 'bold', color: '#F4F1E1' }}>${(item.price || 0).toFixed(2)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Quantity Select */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D4B06A', borderRadius: '24px', overflow: 'hidden' }}>
                <button
                  onClick={() => updateQuantity(item.slug, item.selectedSize, item.quantity - 1)}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ padding: '0 0.8rem', color: '#F4F1E1', fontWeight: 'bold' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.slug, item.selectedSize, item.quantity + 1)}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              {/* Price Calc */}
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                ${((item.price || 0) * item.quantity).toFixed(2)}
              </div>

              {/* Remove button */}
              <button
                onClick={() => removeFromCart(item.slug, item.selectedSize)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ba2f2f',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem'
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart Summary */}
      <div
        style={{
          marginTop: '3rem',
          background: '#F5E7C4',
          padding: '2rem',
          borderRadius: '12px',
          color: '#1C3D2E',
          textAlign: 'right'
        }}
      >
        <h2 style={{ fontFamily: 'Georgia, serif', margin: '0 0 1rem 0' }}>Cart Summary</h2>
        <p style={{ fontSize: '1.1rem', margin: '0 0 1.5rem 0' }}>
          Total Items: <strong>{cart.reduce((a, b) => a + b.quantity, 0)}</strong>
        </p>
        <p style={{ fontSize: '1.5rem', margin: '0 0 2rem 0', fontWeight: 'bold' }}>
          Estimated Total: <span style={{ color: '#11402A' }}>${cartTotal.toFixed(2)}</span>
        </p>

        {/* Local Pickup Only Warning */}
        <p style={{ fontSize: '0.9rem', color: '#ba2f2f', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem' }}>
          ⚠️ Reminder: All sales are strictly LOCAL PICKUP at our St. Petersburg, FL nursery location.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="outline" href="/shop">Continue Shopping</Button>
          <Button variant="green-filled" href="/checkout">Proceed to Checkout</Button>
        </div>
      </div>
    </div>
  );
}

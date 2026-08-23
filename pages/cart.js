import Head from 'next/head';
import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import { checkAgRestrictions, getZoneCompatibility } from '../lib/fulfillment';
import useBfcacheReset from '../hooks/useBfcacheReset';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, userHardinessZone } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [announcement, setAnnouncement] = useState('');

  useBfcacheReset(() => setIsRedirecting(false));

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    if (isRedirecting) return;
    setIsRedirecting(true);
    setCheckoutError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({
            slug: item.slug,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            variantId: item.variantId || item.id,
            name: item.name
          })),
          user_hardiness_zone: userHardinessZone || (typeof window !== 'undefined' ? localStorage.getItem('user_hardiness_zone') || '10a' : '10a')
        })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setCheckoutError(data.error || 'Failed to initialize checkout session. Please try again.');
        setIsRedirecting(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('An error occurred during checkout setup.');
      setIsRedirecting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <Head>
          <title>Your Shopping Cart | The Botanical Bazaar St. Petersburg FL</title>
          <meta name="description" content="Review your tropical plant selections and choose between Standard Shipping and Free Local Nursery Pickup at The Botanical Bazaar." />
          <link rel="canonical" href="https://thebotanicalbazaar.com/cart" />
        </Head>
        <h1 style={{ color: '#D4B06A', marginBottom: '1.5rem' }}>Your Cart is Empty</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>Ready to fill your garden with rare and resilient tropical plants?</p>
        <Button variant="gold-filled" href="/shop">Browse the Catalog</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <Head>
        <title>Your Shopping Cart | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Review your tropical plant selections and choose between Standard Shipping and Free Local Nursery Pickup at The Botanical Bazaar." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/cart" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', marginBottom: '2.5rem' }}>Shopping Cart</h1>
      <div style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }} role="status" aria-live="polite">{announcement}</div>

      {/* Cold Hardiness Advisory Banner */}
      {cart.some(item => getZoneCompatibility(item, userHardinessZone || "10a").matchStatus === "NOT_RECOMMENDED") && (
        <div style={{
          background: "rgba(186, 47, 47, 0.15)",
          border: "1px solid #ba2f2f",
          borderRadius: "10px",
          padding: "1rem 1.25rem",
          marginBottom: "2rem",
          color: "#F5E7C4",
          fontSize: "0.95rem",
          lineHeight: "1.4"
        }}>
          <strong style={{ color: "#ff8a8a", fontFamily: "Cinzel, serif" }}>Cold Protection Advisory (USDA Zone {userHardinessZone || "10a"}):</strong>
          {" "}Your cart includes tropical plant species sensitive to cold conditions in Zone {userHardinessZone || "10a"}. Please ensure indoor or greenhouse winter shelter. Live-plant thermal boxing will be included with standard shipping.
        </div>
      )}

      {/* Cart Summary Header with CTA */}
      <div
        style={{
          marginBottom: '2rem',
          background: '#D4B06A',
          padding: '1.75rem 2rem',
          borderRadius: '12px',
          color: '#00301E'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', margin: '0 0 0.3rem 0', color: '#00301E' }}>Cart Summary</h2>
            <p style={{ fontSize: '1.05rem', margin: '0', color: '#00301E' }}>
              Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} {cart.reduce((a, b) => a + b.quantity, 0) === 1 ? 'item' : 'items'}): <strong style={{ fontSize: '1.4rem' }}>${cartTotal.toFixed(2)}</strong>
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="outline" href="/shop">Continue Shopping</Button>
            <button
              onClick={handleCheckout}
              disabled={isRedirecting}
              style={{
                background: '#00301E',
                color: '#D4B06A',
                border: '1px solid #D4B06A',
                padding: '0.85rem 1.75rem',
                borderRadius: '24px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: isRedirecting ? 'not-allowed' : 'pointer',
                opacity: isRedirecting ? 0.8 : 1,
                transition: 'all 0.2s ease-in-out',
                fontFamily: 'inherit'
              }}
            >
              {isRedirecting ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }}></path>
                </svg>
                Redirecting to secure checkout...
              </span>
            ) : 'Proceed to Checkout'}
            </button>
          </div>
        </div>
        {checkoutError && (
          <p style={{ color: '#ba2f2f', margin: '0.75rem 0 0 0', fontWeight: 'bold', textAlign: 'right' }} role="alert" aria-live="assertive">{checkoutError}</p>
        )}
      </div>

      {/* Cart Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
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
              <Link href={`/product/${encodeURIComponent(String(item.slug || ""))}`}>
                <img
                  src={item.image ? (item.image.startsWith("http") || item.image.startsWith("/") ? item.image : "/" + item.image) : "/assets/placeholder.png"}
                  alt={item.name}
                  onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer' }}
                />
              </Link>
              <div>
                <Link href={`/product/${encodeURIComponent(String(item.slug || ""))}`} style={{ textDecoration: 'none' }}>
                  <h3 style={{ margin: '0 0 0.3rem 0', color: '#D4B06A', fontFamily: 'Cinzel, serif', cursor: 'pointer' }}>{String(item.name || "")}</h3>
                </Link>
                <p style={{ margin: '0 0 0.2rem 0', fontSize: '0.9rem', color: '#E9DCBE' }}>Size: {item.selectedSize || 'Default'}</p>
                <p style={{ margin: '0', fontWeight: 'bold', color: '#F4F1E1' }}>${(item.price || 0).toFixed(2)}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
              {/* Quantity Select */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D4B06A', borderRadius: '24px', overflow: 'hidden' }}>
                <button
                  onClick={() => { updateQuantity(item.slug, item.selectedSize, item.quantity - 1); setAnnouncement(`Decreased quantity of ${item.name} to ${item.quantity - 1}`); }}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={{ padding: '0 0.8rem', color: '#F4F1E1', fontWeight: 'bold' }}>{item.quantity}</span>
                <button
                  onClick={() => { updateQuantity(item.slug, item.selectedSize, item.quantity + 1); setAnnouncement(`Increased quantity of ${item.name} to ${item.quantity + 1}`); }}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.4rem 0.8rem', cursor: 'pointer' }}
                  aria-label="Increase quantity"
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
                onClick={() => { removeFromCart(item.slug, item.selectedSize); setAnnouncement(`Removed ${item.name} from cart`); }}
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

      {/* Shipping & Pickup Information Card */}
      <div
        style={{
          background: "#00301E",
          border: "1px solid #1C3D2E",
          borderRadius: "8px",
          padding: "1.25rem",
          marginBottom: "1.5rem",
          textAlign: "left",
          color: "#E9DCBE",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
        }}
      >
        <div
          style={{
            fontFamily: "Cinzel, serif",
            fontSize: "1rem",
            fontWeight: "bold",
            color: "#D4B06A",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="1" y="3" width="15" height="13"></rect>
            <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
            <circle cx="5.5" cy="18.5" r="2.5"></circle>
            <circle cx="18.5" cy="18.5" r="2.5"></circle>
          </svg>
          Shipping &amp; Nursery Pickup Details
        </div>
        <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.95rem", lineHeight: "1.4", color: "#E9DCBE" }}>
          <strong>Standard Live Plant Shipping:</strong> Shipped with care from St. Petersburg, FL with secure packaging, insulated boxing, and weather holds.
        </p>
        <p style={{ margin: "0 0 0.75rem 0", fontSize: "0.95rem", lineHeight: "1.4", color: "#E9DCBE" }}>
          <strong>Local Nursery Pickup:</strong> Ready for pickup within 24–48 hours by scheduled appointment at our nursery in St. Petersburg, FL ($0.00).
        </p>
        <div style={{ textAlign: "right" }}>
          <Link
            href="/shipping-pickup"
            style={{
              color: "#D4B06A",
              fontWeight: "bold",
              fontSize: "0.9rem",
              textDecoration: "underline",
              fontFamily: "Crimson Text, serif"
            }}
          >
            View Full Shipping &amp; Pickup Policy &rarr;
          </Link>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

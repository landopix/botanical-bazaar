import SEO from "../components/SEO";
import Head from 'next/head';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';
import { isOptimizedCdnUrl } from '../lib/image-utils';
import useBfcacheReset from '../hooks/useBfcacheReset';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [notes, setNotes] = useState('');

  useBfcacheReset(() => setLoading(false));

  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  const handleCheckout = async () => {
    // Pull active cart from React state or fallback to localStorage
    let activeCart = cart;
    if ((!activeCart || activeCart.length === 0) && typeof window !== 'undefined') {
      try {
        const storedCart = localStorage.getItem('botanical_cart');
        if (storedCart) {
          activeCart = JSON.parse(storedCart);
        }
      } catch (err) {
        console.error('Failed to parse localStorage cart fallback:', err);
      }
    }

    if (!activeCart || activeCart.length === 0) {
      setCheckoutError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setLoading(true);
    setCheckoutError('');

    try {
      const storedZone = typeof window !== 'undefined' ? localStorage.getItem('user_hardiness_zone') || '10a' : '10a';

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: activeCart.map(item => ({
            slug: item.slug,
            quantity: item.quantity,
            selectedSize: item.selectedSize,
            variantId: item.variantId || item.id,
            name: item.name
          })),
          user_hardiness_zone: storedZone,
          notes: notes.trim() || undefined
        })
      });

      const data = await response.json();
      const checkoutRedirectUrl = data.webUrl || data.url;

      if (response.ok && checkoutRedirectUrl) {
        window.location.href = checkoutRedirectUrl;
      } else {
        setCheckoutError(data.error || 'Failed to initialize Shopify Checkout. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setCheckoutError('An unexpected error occurred while redirecting to Checkout. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <SEO title="Shopping Cart" description="Review your selected live plant specimens and botanical goods in your cart before checkout." />
        <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>Your Cart is Empty</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          Looks like you haven't added any tropical specimens or rare orchids to your cart yet.
        </p>
        <Button variant="gold-filled" href="/shop">Browse Botanical Catalog</Button>
      </div>
    );
  }

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto', color: '#F5E7C4' }}>
      <SEO title="Shopping Cart" description="Review your selected live plant specimens and botanical goods in your cart before checkout." />

      <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginBottom: '2rem', textAlign: 'center' }}>Your Cart</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {cart.map((item, index) => {
          const itemImg = item.image ? (item.image.startsWith("http") || item.image.startsWith("/") ? item.image : "/" + item.image) : "/assets/placeholder.png";

          return (
            <div
              key={`${item.id}-${item.selectedSize}-${index}`}
              style={{
                background: '#1C3D2E',
                display: 'flex',
                alignItems: 'center',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid #D4B06A',
                justifyContent: 'space-between',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <Link href={`/product/${encodeURIComponent(String(item.slug || ""))}`} style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0, display: 'block', borderRadius: '8px', overflow: 'hidden' }}>
                  <Image
                    src={itemImg}
                    alt={String(item.name || "Botanical specimen")}
                    fill
                    sizes="80px"
                    style={{ objectFit: 'cover' }}
                    unoptimized={!isLocalOrAllowedCdn(itemImg)}
                    onError={(e) => { if (e.target) e.target.src = '/assets/placeholder.png'; }}
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #D4B06A', borderRadius: '20px', overflow: 'hidden', background: '#00301E' }}>
                  <button
                    onClick={() => updateQuantity(item.slug || item.id, item.selectedSize, Math.max(1, item.quantity - 1))}
                    aria-label={`Decrease quantity of ${item.name}`}
                    title={`Decrease quantity of ${item.name}`}
                    style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.8rem', fontWeight: 'bold' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.slug || item.id, item.selectedSize, item.quantity + 1)}
                    aria-label={`Increase quantity of ${item.name}`}
                    title={`Increase quantity of ${item.name}`}
                    style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.4rem 0.8rem', cursor: 'pointer', fontSize: '1.1rem' }}
                  >
                    +
                  </button>
                </div>

                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.1rem', minWidth: '70px', textAlign: 'right', color: '#D4B06A' }}>
                  ${((item.price || 0) * item.quantity).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(item.slug || item.id, item.selectedSize)}
                  aria-label={`Remove ${item.name} from cart`}
                  title={`Remove ${item.name} from cart`}
                  style={{ background: 'none', border: 'none', color: '#ba2f2f', cursor: 'pointer', fontSize: '1.2rem', padding: '0.4rem' }}
                >
                  ✕
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ background: '#123826', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="order-notes" style={{ display: 'block', color: '#D4B06A', fontFamily: 'Cinzel, serif', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Special Instructions / Delivery &amp; Pickup Notes:
          </label>
          <textarea
            id="order-notes"
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific requests or order notes..."
            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #D4B06A', background: '#00301E', color: '#F5E7C4', fontFamily: 'inherit', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212, 176, 106, 0.3)', paddingTop: '1.5rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.3rem', fontFamily: 'Cinzel, serif', color: '#D4B06A' }}>Estimated Subtotal:</span>
          <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#F5E7C4' }}>${cartTotal.toFixed(2)}</span>
        </div>

        <p style={{ fontSize: '0.9rem', color: '#E9DCBE', margin: '0 0 1.5rem 0', fontStyle: 'italic', textAlign: 'center' }}>
          Taxes, Standard Shipping, and Free Nursery Pickup options selected during checkout.
        </p>

        {checkoutError && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              background: 'rgba(186, 47, 47, 0.2)',
              border: '1px solid #ff6b6b',
              color: '#ff8a8a',
              padding: '0.8rem 1rem',
              borderRadius: '8px',
              marginBottom: '1.5rem',
              textAlign: 'center',
              fontSize: '0.95rem'
            }}
          >
            {checkoutError}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button
            onClick={clearCart}
            style={{ background: 'transparent', border: '1px solid #ba2f2f', color: '#ba2f2f', borderRadius: '24px', padding: '0.8rem 1.5rem', cursor: 'pointer', fontFamily: 'Cinzel, serif' }}
          >
            Clear Cart
          </button>
          <Button
            variant="gold-filled"
            onClick={handleCheckout}
            disabled={loading}
            style={{ minWidth: '220px', textAlign: 'center' }}
          >
            {loading ? 'Redirecting to Checkout...' : 'Proceed to Checkout'}
          </Button>
        </div>
      </div>
    </div>
  );
}

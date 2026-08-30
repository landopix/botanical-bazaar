import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { checkAgRestrictions, getZoneCompatibility } from '../lib/fulfillment';
import { isSanityCdnUrl } from '../lib/image-utils';
import useBfcacheReset from '../hooks/useBfcacheReset';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, cartTotal, userHardinessZone } = useCart();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [announcement, setAnnouncement] = useState('');

  useBfcacheReset(() => setIsRedirecting(false));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasRestrictedItems = cart.some(item => checkAgRestrictions(item).isRestricted);
  const hasZoneSensitiveItems = cart.some(item => getZoneCompatibility(item, userHardinessZone || '10a').matchStatus === 'NOT_RECOMMENDED');

  const handleCheckout = async (e) => {
    if (e) e.preventDefault();
    if (isRedirecting) return;

    // Pull latest cart from React state or fallback to localStorage
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

    setIsRedirecting(true);
    setCheckoutError('');

    try {
      const storedZone = userHardinessZone || (typeof window !== 'undefined' ? localStorage.getItem('user_hardiness_zone') || '10a' : '10a');

      const res = await fetch('/api/checkout', {
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
          user_hardiness_zone: storedZone
        })
      });

      const data = await res.json();
      const checkoutRedirectUrl = data.url || data.webUrl;
      if (res.ok && checkoutRedirectUrl) {
        window.location.href = checkoutRedirectUrl;
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

  return (
    <div className="cart-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="drawer-title">Your Cart</h2>
          <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
          <button onClick={onClose} className="close-btn" aria-label="Close cart drawer">✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <button onClick={onClose} className="continue-shopping-btn">Explore Botanical Catalog</button>
          </div>
        ) : (
          <>
            {hasZoneSensitiveItems && (
              <div className="restriction-notice" style={{ background: "rgba(186, 47, 47, 0.15)", borderColor: "#ba2f2f" }}>
                Cold Protection Advisory (Zone {userHardinessZone || "10a"}): Contains tropical plant species requiring indoor protection or greenhouse shelter in your zone. Insulated packaging will be automatically applied.
              </div>
            )}

            {hasRestrictedItems && (
              <div className="restriction-notice">
                Citrus / Regulated Specimen in Cart: Per FDACS regulations, citrus items must be picked up in St. Petersburg or shipped strictly within Florida.
              </div>
            )}

            <div className="cart-items">
              {cart.map((item) => {
                const agCheck = checkAgRestrictions(item);
                const itemImage = item.image ? (item.image.startsWith("http") || item.image.startsWith("/") ? item.image : "/" + item.image) : "/assets/placeholder.png";
                return (
                  <div key={`${item.slug}-${item.selectedSize || 'std'}`} className="cart-item">
                    <Link href={`/product/${encodeURIComponent(String(item.slug || ""))}`} onClick={onClose} className="item-image">
                      <Image
                        src={itemImage}
                        alt={item.name}
                        width={60}
                        height={60}
                        unoptimized={!isSanityCdnUrl(itemImage)}
                      />
                    </Link>
                    <div className="item-details">
                      <Link href={`/product/${encodeURIComponent(String(item.slug || ""))}`} onClick={onClose} className="item-name-link">
                        <div className="item-name">{String(item.name || "")}</div>
                      </Link>
                      <div className="item-meta">{item.selectedSize || 'Standard'}</div>
                      {agCheck.isRestricted && (
                        <span className="item-restriction-tag">FL Restricted</span>
                      )}
                      <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="quantity-controls">
                        <button
                          onClick={() => { updateQuantity(item.slug, item.selectedSize, item.quantity - 1); setAnnouncement(`Decreased quantity of ${item.name} to ${item.quantity - 1}`); }}
                          aria-label={`Decrease quantity of ${item.name}`}
                          title={`Decrease quantity of ${item.name}`}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() => { updateQuantity(item.slug, item.selectedSize, item.quantity + 1); setAnnouncement(`Increased quantity of ${item.name} to ${item.quantity + 1}`); }}
                          aria-label={`Increase quantity of ${item.name}`}
                          title={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button onClick={() => { removeFromCart(item.slug, item.selectedSize); setAnnouncement(`Removed ${item.name} from cart`); }} className="remove-btn" aria-label={`Remove ${item.name} from cart`}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="drawer-footer">
              <div className="subtotal">
                <span>Subtotal</span>
                <span className="total-amount">${cartTotal.toFixed(2)}</span>
              </div>
              <div className="footer-actions">
                <Link href="/cart" rel="nofollow" onClick={onClose} className="view-cart-btn">
                  View Full Cart
                </Link>
                <button
                  onClick={handleCheckout}
                  disabled={isRedirecting}
                  className="checkout-btn"
                >
                  {isRedirecting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 1s linear infinite' }}>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }}></path>
                    </svg>
                    Redirecting to secure checkout...
                  </span>
                ) : 'Proceed to Checkout'}
                </button>
                {checkoutError && (
                  <p className="checkout-error-msg" role="alert" aria-live="assertive">{checkoutError}</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .cart-drawer-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex;
          justify-content: flex-end;
        }
        .cart-drawer {
          width: 100%;
          max-width: 420px;
          height: 100%;
          background: #00301E;
          border-left: 1px solid #D4B06A;
          display: flex;
          flex-direction: column;
          color: #F5E7C4;
          font-family: 'Crimson Text', serif;
          padding: 1.5rem;
          box-sizing: border-box;
          box-shadow: -4px 0 20px rgba(0, 0, 0, 0.4);
        }
        .drawer-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(212, 176, 106, 0.3);
          padding-bottom: 1rem;
          margin-bottom: 1rem;
        }
        .drawer-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.5rem;
          margin: 0;
          text-transform: uppercase;
        }
        .close-btn {
          background: none;
          border: none;
          color: #D4B06A;
          font-size: 1.5rem;
          cursor: pointer;
        }
        .empty-cart {
          text-align: center;
          margin: auto 0;
          color: #E9DCBE;
        }
        .continue-shopping-btn {
          margin-top: 1rem;
          background: #D4B06A;
          color: #00301E;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 20px;
          font-weight: bold;
          cursor: pointer;
        }
        .restriction-notice {
          background: rgba(212, 176, 106, 0.15);
          border: 1px solid #D4B06A;
          border-radius: 6px;
          padding: 0.6rem;
          font-size: 0.85rem;
          color: #F5E7C4;
          margin-bottom: 1rem;
        }
        .cart-items {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .cart-item {
          display: flex;
          gap: 0.8rem;
          background: rgba(28, 61, 46, 0.5);
          border: 1px solid rgba(212, 176, 106, 0.2);
          border-radius: 8px;
          padding: 0.75rem;
          align-items: center;
        }
        .item-image {
          border-radius: 6px;
          overflow: hidden;
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }
        .item-details {
          flex: 1;
        }
        .item-name-link { text-decoration: none; color: inherit; }
        .item-name {
          font-weight: bold;
          color: #F5E7C4;
          font-size: 1rem;
        }
        .item-meta {
          font-size: 0.85rem;
          color: #D4B06A;
        }
        .item-restriction-tag {
          display: inline-block;
          font-size: 0.7rem;
          background: #ba2f2f;
          color: white;
          padding: 1px 4px;
          border-radius: 3px;
          margin: 2px 0;
        }
        .item-price {
          font-weight: bold;
          color: #D4B06A;
          margin-top: 2px;
        }
        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 4px;
        }
        .quantity-controls button {
          background: #1C3D2E;
          border: 1px solid #D4B06A;
          color: #F5E7C4;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          cursor: pointer;
        }
        .remove-btn {
          background: none;
          border: none;
          color: #ff6b6b;
          font-size: 1.1rem;
          cursor: pointer;
        }
        .drawer-footer {
          border-top: 1px solid rgba(212, 176, 106, 0.3);
          padding-top: 1rem;
          margin-top: 1rem;
        }
        .subtotal {
          display: flex;
          justify-content: space-between;
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: #F5E7C4;
        }
        .total-amount {
          color: #D4B06A;
          font-weight: bold;
        }
        .footer-actions {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .footer-actions :global(.view-cart-btn) {
          display: block;
          text-align: center;
          background: transparent;
          border: 1px solid #D4B06A;
          color: #D4B06A;
          padding: 0.6rem;
          border-radius: 20px;
          text-decoration: none;
          font-weight: bold;
        }
        .checkout-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: #D4B06A;
          color: #00301E;
          padding: 0.75rem;
          border-radius: 20px;
          border: 1px solid #D4B06A;
          font-weight: bold;
          font-family: inherit;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .checkout-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .checkout-error-msg {
          color: #ff6b6b;
          font-size: 0.85rem;
          margin: 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
}

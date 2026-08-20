import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { checkAgRestrictions, getZoneCompatibility } from '../lib/fulfillment';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, updateQuantity, removeFromCart, cartTotal, fulfillmentMethod, setFulfillmentMethod, userHardinessZone } = useCart();

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

  return (
    <div className="cart-drawer-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Shopping Cart Drawer">
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2 className="drawer-title">Your Cart</h2>
          <button onClick={onClose} className="close-btn" aria-label="Close cart drawer">✕</button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <button onClick={onClose} className="continue-shopping-btn">Explore Botanical Catalog</button>
          </div>
        ) : (
          <>
            <div className="fulfillment-toggle">
              <label className={`toggle-option ${fulfillmentMethod === 'shipping' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="drawer-fulfillment"
                  value="shipping"
                  checked={fulfillmentMethod === 'shipping'}
                  onChange={() => setFulfillmentMethod('shipping')}
                />
                <span>Standard Shipping</span>
              </label>
              <label className={`toggle-option ${fulfillmentMethod === 'pickup' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="drawer-fulfillment"
                  value="pickup"
                  checked={fulfillmentMethod === 'pickup'}
                  onChange={() => setFulfillmentMethod('pickup')}
                />
                <span>St. Pete Pickup ($0.00)</span>
              </label>
            </div>


            {hasZoneSensitiveItems && (
              <div className="restriction-notice" style={{ background: "rgba(186, 47, 47, 0.15)", borderColor: "#ba2f2f" }}>
                ❄️ Cold Protection Advisory (Zone {userHardinessZone || "10a"}): Contains tropical plant species requiring indoor protection or greenhouse shelter in your zone. Insulated packaging will be automatically applied.
              </div>
            )}

            {hasRestrictedItems && (
              <div className="restriction-notice">
                ⚠️ Citrus / Regulated Specimen in Cart: Per FDACS regulations, citrus items must be picked up in St. Petersburg or shipped strictly within Florida.
              </div>
            )}

            <div className="cart-items">
              {cart.map((item) => {
                const agCheck = checkAgRestrictions(item);
                return (
                  <div key={`${item.slug}-${item.selectedSize || 'std'}`} className="cart-item">
                    <div className="item-image">
                      <Image
                        src={item.image ? (item.image.startsWith("http") || item.image.startsWith("/") ? item.image : "/" + item.image) : "/assets/placeholder.png"}
                        alt={item.name}
                        width={60}
                        height={60}
                        unoptimized={!item.image || !item.image.includes("cdn.sanity.io")}
                      />
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">{item.selectedSize || 'Standard'}</div>
                      {agCheck.isRestricted && (
                        <span className="item-restriction-tag">FL Restricted</span>
                      )}
                      <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="quantity-controls">
                        <button onClick={() => updateQuantity(item.slug, item.quantity - 1, item.selectedSize)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.slug, item.quantity + 1, item.selectedSize)}>+</button>
                      </div>
                    </div>
                    <button onClick={() => removeFromCart(item.slug, item.selectedSize)} className="remove-btn" aria-label="Remove item">
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
                <Link href="/cart" onClick={onClose} className="view-cart-btn">
                  View Full Cart
                </Link>
                <Link href="/checkout" onClick={onClose} className="checkout-btn">
                  Proceed to Checkout
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
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
        .fulfillment-toggle {
          display: flex;
          background: #1C3D2E;
          border: 1px solid #D4B06A;
          border-radius: 8px;
          padding: 4px;
          margin-bottom: 1rem;
        }
        .toggle-option {
          flex: 1;
          text-align: center;
          padding: 0.4rem;
          font-size: 0.85rem;
          cursor: pointer;
          border-radius: 6px;
          color: #E9DCBE;
        }
        .toggle-option.active {
          background: #D4B06A;
          color: #00301E;
          font-weight: bold;
        }
        .toggle-option input {
          display: none;
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
        .footer-actions :global(.checkout-btn) {
          display: block;
          text-align: center;
          background: #D4B06A;
          color: #00301E;
          padding: 0.75rem;
          border-radius: 20px;
          text-decoration: none;
          font-weight: bold;
        }
      `}</style>
    </div>
  );
}

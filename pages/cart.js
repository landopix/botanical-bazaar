import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, fulfillmentMethod, setFulfillmentMethod } = useCart();

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
                src={item.image ? (item.image.startsWith("http") || item.image.startsWith("/") ? item.image : "/" + item.image) : "/assets/placeholder.png"}
                alt={item.name}
                onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div>
                <h3 style={{ margin: '0 0 0.3rem 0', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>{item.name}</h3>
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
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span style={{ padding: '0 0.8rem', color: '#F4F1E1', fontWeight: 'bold' }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.slug, item.selectedSize, item.quantity + 1)}
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

      {/* Fulfillment Selection Section */}
      <div style={{ marginTop: '2.5rem', background: '#123826', padding: '1.5rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', margin: '0 0 1rem 0', fontSize: '1.3rem' }}>
          Choose Fulfillment Method
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {/* Standard Shipping Card */}
          <div
            onClick={() => setFulfillmentMethod('shipping')}
            style={{
              padding: '1.25rem',
              borderRadius: '10px',
              cursor: 'pointer',
              border: fulfillmentMethod === 'shipping' ? '2px solid #D4B06A' : '1px solid #1C3D2E',
              backgroundColor: fulfillmentMethod === 'shipping' ? '#1C3D2E' : '#00301E',
              boxShadow: fulfillmentMethod === 'shipping' ? '0 0 10px rgba(212, 176, 106, 0.25)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>
                Standard Shipping
              </span>
              <span style={{ fontSize: '0.85rem', color: '#E9DCBE', background: 'rgba(212, 176, 106, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                Calculated at checkout
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#E9DCBE', lineHeight: '1.4' }}>
              Shipped with care from St. Petersburg, FL with secure live-plant packaging and weather holds.
            </p>
          </div>

          {/* Local Nursery Pickup Card */}
          <div
            onClick={() => setFulfillmentMethod('pickup')}
            style={{
              padding: '1.25rem',
              borderRadius: '10px',
              cursor: 'pointer',
              border: fulfillmentMethod === 'pickup' ? '2px solid #D4B06A' : '1px solid #1C3D2E',
              backgroundColor: fulfillmentMethod === 'pickup' ? '#1C3D2E' : '#00301E',
              boxShadow: fulfillmentMethod === 'pickup' ? '0 0 10px rgba(212, 176, 106, 0.25)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>
                Local Nursery Pickup
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#27ae60', background: 'rgba(39, 174, 96, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                $0.00 / Free Pickup
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#E9DCBE', lineHeight: '1.4' }}>
              Pick up directly at our nursery location in St. Petersburg, FL. Flexible scheduled appointment slots available.
            </p>
          </div>
        </div>
      </div>

      {/* Cart Summary */}
      <div
        style={{
          marginTop: '2rem',
          background: '#D4B06A',
          padding: '2rem',
          borderRadius: '12px',
          color: '#00301E',
          textAlign: 'right'
        }}
      >
        <h2 style={{ fontFamily: 'Cinzel, serif', margin: '0 0 1rem 0', color: '#00301E' }}>Cart Summary</h2>
        <p style={{ fontSize: '1.1rem', margin: '0 0 0.5rem 0', color: '#00301E' }}>
          Total Items: <strong>{cart.reduce((a, b) => a + b.quantity, 0)}</strong>
        </p>
        <p style={{ fontSize: '1.1rem', margin: '0 0 1rem 0', color: '#00301E' }}>
          Fulfillment: <strong>{fulfillmentMethod === 'pickup' ? 'Local Nursery Pickup ($0.00)' : 'Standard Shipping (Calculated at checkout)'}</strong>
        </p>
        <p style={{ fontSize: '1.5rem', margin: '0 0 1.5rem 0', fontWeight: 'bold', color: '#00301E' }}>
          Subtotal: <span style={{ color: '#00301E' }}>${cartTotal.toFixed(2)}</span>
        </p>

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
            <strong>Local Nursery Pickup:</strong> Free pickup available at our nursery in St. Petersburg, FL ($0.00).
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

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="outline" href="/shop">Continue Shopping</Button>
          <Button variant="green-filled" href="/checkout">Proceed to Checkout</Button>
        </div>
      </div>
    </div>
  );
}

import Head from 'next/head';
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const router = useRouter();
  const { cart, cartTotal, fulfillmentMethod, setFulfillmentMethod, userHardinessZone } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    shippingAddress: '',
    city: '',
    state: 'FL',
    zip: '',
    pickupDate: '',
    notes: ''
  });

  if (cart.length === 0) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
      <Head>
        <title>Secure Checkout | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Complete your plant order with secure Stripe payment. Select Standard Shipping or Local Nursery Pickup in St. Petersburg, FL." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/checkout" />
      </Head>
        <h1 style={{ color: '#D4B06A', marginBottom: '1.5rem' }}>No Items to Checkout</h1>
        <Button variant="gold-filled" href="/shop">Browse Catalog</Button>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({ slug: item.slug, quantity: item.quantity, selectedSize: item.selectedSize })),
          fulfillment_method: fulfillmentMethod,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: fulfillmentMethod === 'shipping' ? {
            address: formData.shippingAddress,
            city: formData.city,
            state: formData.state,
            zip: formData.zip
          } : null,
          pickup_date: fulfillmentMethod === 'pickup' ? formData.pickupDate : null,
          user_hardiness_zone: userHardinessZone || (typeof window !== 'undefined' ? localStorage.getItem('user_hardiness_zone') || '10a' : '10a'),
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Failed to initialize checkout session. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('An error occurred during checkout setup.');
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', marginBottom: '2.5rem' }}>Order Checkout</h1>

      {/* Fulfillment Toggle Banner */}
      <div style={{ background: '#123826', padding: '1.5rem', borderRadius: '12px', border: '1px solid #D4B06A', marginBottom: '2.5rem' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', margin: '0 0 1rem 0', fontSize: '1.2rem', textAlign: 'center' }}>
          Select Fulfillment Method
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div
            onClick={() => setFulfillmentMethod('shipping')}
            style={{
              padding: '1.2rem',
              borderRadius: '10px',
              cursor: 'pointer',
              border: fulfillmentMethod === 'shipping' ? '2px solid #D4B06A' : '1px solid #1C3D2E',
              backgroundColor: fulfillmentMethod === 'shipping' ? '#1C3D2E' : '#00301E',
              boxShadow: fulfillmentMethod === 'shipping' ? '0 0 10px rgba(212, 176, 106, 0.25)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 'bold', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>Standard Shipping</span>
              <span style={{ fontSize: '0.8rem', color: '#E9DCBE', background: 'rgba(212, 176, 106, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                Calculated at checkout
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#E9DCBE' }}>
              Shipped with care from St. Petersburg, FL with secure packaging & weather holds.
            </p>
          </div>

          <div
            onClick={() => setFulfillmentMethod('pickup')}
            style={{
              padding: '1.2rem',
              borderRadius: '10px',
              cursor: 'pointer',
              border: fulfillmentMethod === 'pickup' ? '2px solid #D4B06A' : '1px solid #1C3D2E',
              backgroundColor: fulfillmentMethod === 'pickup' ? '#1C3D2E' : '#00301E',
              boxShadow: fulfillmentMethod === 'pickup' ? '0 0 10px rgba(212, 176, 106, 0.25)' : 'none',
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontWeight: 'bold', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>Local Nursery Pickup</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#27ae60', background: 'rgba(39, 174, 96, 0.15)', padding: '2px 8px', borderRadius: '12px' }}>
                $0.00 / Free Pickup
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#E9DCBE' }}>
              Pick up at our nursery in St. Petersburg, FL. Flexible scheduled slots available.
            </p>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
        {/* Checkout Form */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', borderBottom: '1px solid #1C3D2E', paddingBottom: '0.5rem' }}>
            {fulfillmentMethod === 'shipping' ? 'Shipping & Contact Details' : 'Pickup & Contact Details'}
          </h2>
          <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Your Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
                />
              </div>
            </div>

            {fulfillmentMethod === 'shipping' ? (
              <>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Street Address</label>
                  <input
                    type="text"
                    name="shippingAddress"
                    required
                    placeholder="123 Tropical Ave"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>State</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>ZIP Code</label>
                    <input
                      type="text"
                      name="zip"
                      required
                      value={formData.zip}
                      onChange={handleInputChange}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Preferred Pickup Date</label>
                <input
                  type="date"
                  name="pickupDate"
                  required
                  value={formData.pickupDate}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1' }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Order / Special Instructions</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special packing requests, weather considerations, or questions..."
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1', fontFamily: 'inherit' }}
              />
            </div>

            <Button type="submit" variant="gold-filled" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Processing Secure Stripe Checkout...' : 'Proceed to Payment'}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div style={{ flex: '1 1 350px', background: '#123826', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', height: 'fit-content' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', margin: '0 0 1.5rem 0' }}>Order Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {cart.map(item => (
              <div key={`${item.slug}-${item.selectedSize}`} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1C3D2E', paddingBottom: '0.6rem' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#E9DCBE' }}>Size: {item.selectedSize || 'Standard'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#E9DCBE' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 'bold' }}>${((item.price || 0) * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #1C3D2E', paddingTop: '1rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#E9DCBE', marginBottom: '0.5rem' }}>
              <span>Fulfillment:</span>
              <span style={{ fontWeight: 'bold', color: '#D4B06A' }}>
                {fulfillmentMethod === 'pickup' ? 'Local Pickup ($0.00)' : 'Standard Shipping'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '1px solid #D4B06A', paddingTop: '0.75rem' }}>
              <span>Subtotal:</span>
              <span style={{ color: '#D4B06A' }}>${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#E9DCBE', marginTop: '1.5rem', fontStyle: 'italic', textAlign: 'center', lineHeight: '1.4' }}>
            {fulfillmentMethod === 'shipping'
              ? 'Shipped with care from St. Petersburg, FL with insulated live-plant packaging and weather holds.'
              : 'Nursery pickup in St. Petersburg, FL ($0.00). Full guarantee on live plant health at collection.'}
          </p>
        </div>
      </div>
    </div>
  );
}

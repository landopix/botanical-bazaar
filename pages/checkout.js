import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const router = useRouter();
  const { cart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    notes: ''
  });

  if (cart.length === 0) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
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
      // Build dynamic payload mapping cart items and pickup notes
      const line_items = cart.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${item.name} (${item.selectedSize || 'Standard'})`,
            description: `Zone Compatibility: ${item.zones ? item.zones.join(', ') : '9, 10, 11'}. Local Pickup St. Pete.`,
            images: item.image ? [item.image.startsWith('http') ? item.image : `https://thebotanicalbazaar.com/${item.image}`] : []
          },
          unit_amount: Math.round((item.price || 0) * 100), // Stripe expects cents
        },
        quantity: item.quantity
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart.map(item => ({ slug: item.slug, quantity: item.quantity, selectedSize: item.selectedSize })),
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          pickup_date: formData.pickupDate,
          notes: formData.notes
        })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        // Redirect to secure Stripe Checkout page
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
      <h1 style={{ color: '#D4B06A', textAlign: 'center', marginBottom: '2.5rem' }}>Local Pickup Checkout</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
        {/* Checkout Form */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', borderBottom: '1px solid #1C3D2E', paddingBottom: '0.5rem' }}>
            Pickup & Contact Details
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

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Order / Special Notes</label>
              <textarea
                name="notes"
                rows="3"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Any special instructions or questions for our guides..."
                style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#1C3D2E', color: '#F4F1E1', fontFamily: 'inherit' }}
              />
            </div>

            <Button type="submit" variant="gold-filled" disabled={loading} style={{ width: '100%', marginTop: '1rem' }}>
              {loading ? 'Processing Secure Stripe Checkout...' : 'Go to Secure Payment'}
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
                  <div style={{ fontSize: '0.85rem', color: '#E9DCBE' }}>Size: {item.selectedSize}</div>
                  <div style={{ fontSize: '0.85rem', color: '#E9DCBE' }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 'bold' }}>${((item.price || 0) * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', borderTop: '1px solid #D4B06A', paddingTop: '1rem' }}>
            <span>Estimated Total:</span>
            <span style={{ color: '#D4B06A' }}>${cartTotal.toFixed(2)}</span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#E9DCBE', marginTop: '1.5rem', fontStyle: 'italic', textAlign: 'center' }}>
            Pickup at Nursery in St. Petersburg, FL. Full guarantee on live plant health at moment of collection.
          </p>
        </div>
      </div>
    </div>
  );
}

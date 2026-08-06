import React, { useState } from 'react';
import Button from '../components/Button';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '700px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>Contact Our Nursery Guides</h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '3rem', color: '#E9DCBE' }}>
        Have questions about stock, local pickup schedules, or plant care compatibility? Fill out the secure form below.
      </p>

      {submitted ? (
        <div style={{ background: '#123826', padding: '2.5rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center' }}>
          <h2 style={{ color: '#D4B06A', marginTop: 0 }}>Message Received!</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Our experienced horticulturists will get back to you shortly.</p>
          <Button variant="gold-filled" href="/shop">Browse Plants</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Your Full Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>How Can We Help You?</label>
            <textarea
              required
              rows="5"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1', fontFamily: 'inherit' }}
            />
          </div>

          <Button type="submit" variant="gold-filled" style={{ width: '100%' }}>Send Message</Button>
        </form>
      )}
    </div>
  );
}

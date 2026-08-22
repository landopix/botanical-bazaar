import Head from 'next/head';
import React, { useState } from 'react';
import Button from '../components/Button';
import useBfcacheReset from '../hooks/useBfcacheReset';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useBfcacheReset(() => setSubmitting(false));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (formData.name && formData.email && formData.message) {
      setSubmitting(true);
      try {
        const res = await fetch('/api/submit-form', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            formType: 'contact',
            name: formData.name,
            email: formData.email,
            message: formData.message
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setSubmitted(true);
        } else {
          setErrorMsg(data.error || 'Failed to send message. Please try again.');
        }
      } catch (err) {
        console.error('Error submitting form:', err);
        setErrorMsg('Network error. Please try again later.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '700px', margin: '0 auto', fontFamily: 'Crimson Text, serif', color: '#E9DCBE' }}>
      <Head>
        <title>Contact Our Nursery Guides | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Get in touch with the horticulturists at The Botanical Bazaar in St. Petersburg, FL for plant availability, care guides, and nursery pickup details." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/contact" />
        <meta property="og:title" content="Contact Our Nursery Guides | The Botanical Bazaar St. Petersburg FL" />
        <meta property="og:description" content="Get in touch with the horticulturists at The Botanical Bazaar in St. Petersburg, FL." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/contact" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1rem', fontSize: '2.5rem' }}>
        Contact Our Nursery Guides
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', marginBottom: '3rem', color: '#E9DCBE', lineHeight: '1.6' }}>
        Have questions about stock, local pickup schedules, or plant care compatibility? Call or text us at <a href="tel:7273507876" style={{ color: "#D4B06A", textDecoration: "underline" }}>(727) 350-7876</a> or fill out the secure form below.
      </p>

      {submitted ? (
        <div style={{ background: '#123826', padding: '2.5rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center' }}>
          <h2 style={{ color: '#D4B06A', marginTop: 0, fontFamily: 'Cinzel, serif', fontSize: '1.8rem' }}>Message Received!</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem', color: '#F5E7C4' }}>Our experienced horticulturists will get back to you shortly.</p>
          <Button variant="gold-filled" href="/shop">Browse Plants</Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(224, 108, 117, 0.15)',
              border: '1px solid #e06c75',
              color: '#f08d8d',
              padding: '0.8rem 1rem',
              borderRadius: '6px',
              fontSize: '0.95rem'
            }}>
              {errorMsg}
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Your Full Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold', color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              How Can We Help You?
            </label>
            <textarea
              required
              rows="5"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
          </div>

          <Button type="submit" variant="gold-filled" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Sending Message...' : 'Send Message'}
          </Button>
        </form>
      )}
    </div>
  );
}

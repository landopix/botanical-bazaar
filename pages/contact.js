import Head from 'next/head';
import React, { useState } from 'react';
import Button from '../components/Button';

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        if (res.ok) {
          setSubmitted(true);
        } else {
          alert('Failed to send message. Please try again.');
        }
      } catch (err) {
        console.error('Error submitting form:', err);
        alert('Network error. Please try again later.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '700px', margin: '0 auto' }}>
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
      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>Contact Our Nursery Guides</h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '3rem', color: '#E9DCBE' }}>
        Have questions about stock, local pickup schedules, or plant care compatibility? Call or text us at <a href="tel:7273507876" style={{ color: "#D4B06A", textDecoration: "underline" }}>(727) 350-7876</a> or fill out the secure form below.
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
            <label htmlFor="contact-react-name" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Your Full Name</label>
            <input
              id="contact-react-name"
              type="text"
              required
              aria-describedby="contact-react-status"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1' }}
            />
          </div>

          <div>
            <label htmlFor="contact-react-email" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>Email Address</label>
            <input
              id="contact-react-email"
              type="email"
              required
              aria-describedby="contact-react-status"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1' }}
            />
          </div>

          <div>
            <label htmlFor="contact-react-message" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>How Can We Help You?</label>
            <textarea
              id="contact-react-message"
              required
              rows="5"
              aria-describedby="contact-react-status"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #D4B06A', backgroundColor: '#123826', color: '#F4F1E1', fontFamily: 'inherit' }}
            />
          </div>

          <div id="contact-react-status" role="status" aria-live="polite" style={{ display: 'none' }}></div>

          <Button type="submit" variant="gold-filled" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Sending...' : 'Send Message'}
          </Button>
        </form>
      )}
    </div>
  );
}

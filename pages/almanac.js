import Head from 'next/head';
import React, { useState } from 'react';
import Button from '../components/Button';
import CareSheetCard from '../components/CareSheetCard';

export default function Almanac() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setStatus('');

    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'almanac_signup',
          email,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('Thank you for subscribing to The Botanical Almanac!');
        setEmail('');
      } else {
        setStatus(data.message || 'Subscription failed. Please try again.');
      }
    } catch (err) {
      console.error('Almanac subscription error:', err);
      setStatus('An error occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1050px', margin: '0 auto', color: '#E9DCBE' }}>
      <Head>
        <title>The Almanac & Nursery Dispatch | The Botanical Bazaar</title>
        <meta name="description" content="Subscribe to The Botanical Almanac for seasonal updates, batch restock alerts, and nursery dispatches from St. Petersburg, Florida." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/almanac" />
        <meta property="og:title" content="The Almanac & Nursery Dispatch | The Botanical Bazaar" />
        <meta property="og:description" content="Seasonal updates, batch restock alerts, and nursery dispatches from St. Petersburg, Florida." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/lantern.png" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '1rem' }}>
        The Botanical Almanac
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic' }}>
        Our central channel for customer communications, seasonal nursery dispatches, upcoming batch releases, and exclusive botanical subscriber updates from St. Petersburg, Florida.
      </p>

      <section style={{ background: '#123826', padding: '2.5rem 2rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center', marginBottom: '3.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.8rem' }}>
          Subscribe to Nursery Updates
        </h2>
        <p style={{ maxWidth: '650px', margin: '0.8rem auto 1.8rem auto', lineHeight: '1.6', fontSize: '1.05rem' }}>
          Receive timely seasonal propagation news, cold front advisory warnings, restock notices for rare collector species, and invitations to St. Pete nursery events.
        </p>

        <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', maxWidth: '520px', margin: '0 auto', flexWrap: 'wrap' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{
              flex: 1,
              minWidth: '240px',
              padding: '0.8rem 1rem',
              borderRadius: '24px',
              border: '1px solid #D4B06A',
              background: '#00301E',
              color: '#F5E7C4',
              fontFamily: 'inherit',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#D4B06A',
              color: '#00301E',
              border: 'none',
              borderRadius: '24px',
              padding: '0.8rem 1.6rem',
              fontWeight: 'bold',
              fontFamily: 'Cinzel, serif',
              cursor: submitting ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
            }}
          >
            {submitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {status && (
          <p style={{ marginTop: '1.2rem', color: '#D4B06A', fontWeight: 'bold' }}>
            {status}
          </p>
        )}
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3.5rem' }}>
        <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.4rem' }}>
              Plant Care Sheets
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '0.98rem', color: '#F5E7C4' }}>
              Looking for individual cultivation instructions, light, watering, and soil specs for specific tropical species? Explore our dedicated Care Sheets library.
            </p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="gold-filled" href="/care-sheets">Browse Plant Care Sheets &rarr;</Button>
          </div>
        </div>

        <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.4rem' }}>
              USDA Zone Guide
            </h3>
            <p style={{ lineHeight: '1.6', fontSize: '0.98rem', color: '#F5E7C4' }}>
              Check microclimate compatibility and winter protection threshold guidance tailored for growers in Zone 9b/10a and beyond.
            </p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Button variant="outline" href="/zones">Explore Zone Guide &rarr;</Button>
          </div>
        </div>
      </section>
    </div>
  );
}

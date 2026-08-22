import Head from 'next/head';
import React, { useState } from 'react';
import { sanityClient, isSanityConfigured } from '../lib/sanity';
import Button from '../components/Button';
import CareSheetCard from '../components/CareSheetCard';
import CareSheetSkeleton from '../components/skeletons/CareSheetSkeleton';
import useBfcacheReset from '../hooks/useBfcacheReset';

export default function Almanac({ careSheets }) {
  const sheets = careSheets && careSheets.length > 0 ? careSheets : [];

  // Almanac subscription form state
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [statusType, setStatusType] = useState('success');

  useBfcacheReset(() => setSubmitting(false));

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusType('error');
      setStatusMsg('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);
    setStatusMsg('');

    try {
      const res = await fetch('/api/inquiry/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email,
          customerName: 'Almanac Subscriber',
          inquiryType: 'almanac_subscription',
          subject: 'Botanical Almanac Monthly Care Dispatch Signup',
          message: `Subscriber requested monthly Almanac care dispatches for ${email}`
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusType('success');
        setStatusMsg('Welcome! You are subscribed to our monthly Almanac botanical dispatches.');
        setEmail('');
      } else {
        setStatusType('error');
        setStatusMsg(data.error || 'Unable to subscribe right now. Please try again.');
      }
    } catch (err) {
      console.error('Almanac subscription error:', err);
      setStatusType('error');
      setStatusMsg('An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1050px', margin: '0 auto', color: '#E9DCBE', fontFamily: 'Crimson Text, serif' }}>
      <Head>
        <title>The Almanac & Plant Care Guides | The Botanical Bazaar</title>
        <meta name="description" content="Explore tropical plant care sheets, seasonal gardening advice, and botanical guides curated for St. Petersburg growers by The Botanical Bazaar." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/almanac" />
        <meta property="og:title" content="The Almanac & Plant Care Guides | The Botanical Bazaar" />
        <meta property="og:description" content="Explore tropical plant care sheets, seasonal gardening advice, and botanical guides curated for St. Petersburg growers." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/lantern.png" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '1rem' }}>
        The Almanac
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', maxWidth: '750px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic' }}>
        Welcome to our Almanac, a curated library of tropical plant care sheets and cultivation guides for curious growers in St. Petersburg, Florida.
      </p>

      {/* Almanac Email Dispatch Subscription Form */}
      <section style={{ background: '#00301E', padding: '2.5rem 1.8rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center', marginBottom: '3.5rem', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, fontSize: '1.8rem', letterSpacing: '0.05em' }}>
          Subscribe to Monthly Almanac Dispatches
        </h2>
        <p style={{ maxWidth: '620px', margin: '0.5rem auto 1.5rem auto', fontSize: '1.1rem', color: '#F5E7C4', lineHeight: '1.6' }}>
          Receive seasonal St. Petersburg planting advice, cold hardiness weather alerts, and rare specimen releases straight to your inbox.
        </p>

        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', maxWidth: '460px', margin: '0 auto' }}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            required
            style={{
              padding: '0.8rem 1.2rem',
              borderRadius: '8px',
              border: '1px solid #D4B06A',
              width: '100%',
              fontFamily: 'Crimson Text, serif',
              fontSize: '1.05rem',
              background: '#123826',
              color: '#F5E7C4',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#D4B06A',
              color: '#00301E',
              border: '1px solid #D4B06A',
              padding: '0.8rem 2.2rem',
              borderRadius: '24px',
              fontFamily: 'Cinzel, serif',
              fontWeight: 'bold',
              fontSize: '1rem',
              cursor: submitting ? 'not-allowed' : 'pointer',
              width: '100%',
              transition: 'all 0.2s ease'
            }}
          >
            {submitting ? 'Submitting...' : 'Join The Almanac Registry'}
          </button>
        </form>

        {statusMsg && (
          <div style={{
            marginTop: '1.2rem',
            padding: '0.8rem 1rem',
            borderRadius: '6px',
            background: statusType === 'success' ? 'rgba(212, 176, 106, 0.15)' : 'rgba(224, 108, 117, 0.15)',
            border: statusType === 'success' ? '1px solid #D4B06A' : '1px solid #e06c75',
            color: statusType === 'success' ? '#D4B06A' : '#f08d8d',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}>
            {statusMsg}
          </div>
        )}
      </section>

      <section style={{ marginBottom: '3.5rem' }}>
        <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', borderBottom: '1px solid #D4B06A', paddingBottom: '0.5rem', marginBottom: '1.8rem' }}>
          Botanical Care Sheets
        </h2>
        {sheets.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
            {sheets.map((sheet, i) => (
              <CareSheetCard key={sheet?._id || sheet?.commonName || i} sheet={sheet} />
            ))}
          </div>
        ) : (
          <div style={{
            background: '#00301E',
            border: '1px solid #D4B06A',
            borderRadius: '12px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            margin: '1rem auto 2.5rem auto',
            maxWidth: '650px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>

            <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.8rem', marginTop: 0, marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
              New Botanical Updates Coming Soon!
            </h3>
            <p style={{ color: '#E9DCBE', fontSize: '1.1rem', margin: '0 0 1.5rem 0', lineHeight: '1.6' }}>
              Our plant care library is currently updating with fresh cultivation sheets and tropical guides. Check back soon for detailed growing instructions.
            </p>
          </div>
        )}
      </section>

      <section style={{ background: '#00301E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', textAlign: 'center' }}>
        <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0 }}>Explore Climate & Care Resources</h3>
        <p style={{ maxWidth: '600px', margin: '0.5rem auto 1.5rem auto' }}>
          Discover USDA hardiness zone recommendations or schedule a 1-on-1 botanical consultation with our St. Pete nursery staff.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button variant="gold-filled" href="/zones">Hardiness Zone Guide</Button>
          <Button variant="outline" href="/consultations">Book Consultation</Button>
        </div>
      </section>
    </div>
  );
}

export async function getStaticProps() {
  let careSheets = null;

  try {
    if (isSanityConfigured()) {
      const query = `*[_type == "plantCareSheet"]{
        botanicalName,
        commonName,
        lightNeeds,
        wateringNeeds,
        zoneCompatibility,
        careInstructions,
        "imageUrl": image.asset->url
      }`;
      const res = await sanityClient.fetch(query);
      if (Array.isArray(res) && res.length > 0) {
        careSheets = res;
      }
    }
  } catch (err) {
    console.warn('Sanity plantCareSheet fetch error:', err.message);
  }

  return {
    props: {
      careSheets,
    },
    revalidate: 60,
  };
}

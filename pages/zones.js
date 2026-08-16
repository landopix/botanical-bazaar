import Head from 'next/head';
import React from 'react';
import Button from '../components/Button';

export default function Zones() {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Head>
        <title>USDA Hardiness Zone Guide & Cold Tolerance | The Botanical Bazaar</title>
        <meta name="description" content="Determine cold hardiness guidance and temperature thresholds for rare tropical plants, orchids, and aroids in USDA Zones 9b, 10a, and 10b." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/zones" />
        <meta property="og:title" content="USDA Hardiness Zone Guide & Cold Tolerance | The Botanical Bazaar" />
        <meta property="og:description" content="Determine cold hardiness guidance and temperature thresholds for rare tropical plants, orchids, and aroids." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/zones" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem' }}>Best Plants for Your Zone</h1>
      <p style={{ fontSize: '1.2rem', lineHeight: '1.6', textAlign: 'center', marginBottom: '3rem', color: '#E9DCBE' }}>
        Learn about local Florida microclimates and choose highly resilient species fully compatible with USDA Zones 9b, 10a, and 11.
      </p>

      <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', marginBottom: '3rem' }}>
        <h2 style={{ color: '#D4B06A', marginTop: 0, fontFamily: 'Cinzel, serif' }}>St. Petersburg & Tampa Hardiness</h2>
        <p style={{ lineHeight: '1.6' }}>
          Most of Pinellas County lies in Zone 10a, with inland areas classified as 9b. Coastal microclimates occasionally experience Zone 10b temperatures. Choosing species that are optimized for high humidity and warmth ensures long-term thriving without heavy seasonal protection.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: '#123826', padding: '1.5rem', borderRadius: '8px', border: '1px solid #D4B06A' }}>
          <h3 style={{ color: '#D4B06A', marginTop: 0 }}>Zone 9b</h3>
          <p>Tolerates light brief cold snaps. Perfect for hardy ginger varieties and resilient citrus hybrids.</p>
        </div>
        <div style={{ background: '#123826', padding: '1.5rem', borderRadius: '8px', border: '1px solid #D4B06A' }}>
          <h3 style={{ color: '#D4B06A', marginTop: 0 }}>Zone 10a</h3>
          <p>Thrives in warmth. Absolute sweet spot for most collectible Philodendrons and Anthuriums.</p>
        </div>
        <div style={{ background: '#123826', padding: '1.5rem', borderRadius: '8px', border: '1px solid #D4B06A' }}>
          <h3 style={{ color: '#D4B06A', marginTop: 0 }}>Zone 11</h3>
          <p>Extreme tropicals. Requires constant warmth and protection from cold wind drafts.</p>
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Button variant="gold-filled" href="/shop">Filter Shop by Zone</Button>
      </div>
    </div>
  );
}

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Terms() {
  return (
    <>
      <Head>
        <title>Terms of Service & Sales Policies | The Botanical Bazaar</title>
        <meta
          name="description"
          content="Review the terms of service, live plant sales policies, ordering terms, and website usage conditions for The Botanical Bazaar LLC in St. Petersburg, FL."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/terms" />
      </Head>

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '860px', margin: '0 auto', boxSizing: 'border-box', color: '#E9DCBE', lineHeight: '1.7' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem', borderBottom: '1px solid rgba(212, 176, 106, 0.3)', paddingBottom: '2rem' }}>
          <h1
            style={{
              color: '#D4B06A',
              fontFamily: 'Cinzel, serif',
              fontSize: '2.5rem',
              letterSpacing: '0.08em',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}
          >
            Terms of Service &amp; Store Policies
          </h1>
          <p style={{ color: '#8DA38B', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>
            The Botanical Bazaar LLC &bull; St. Petersburg, Florida
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.05rem' }}>
          <section style={{ background: '#1C3D2E', padding: '1.8rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              1. Overview &amp; Agreement
            </h2>
            <p style={{ marginTop: 0 }}>
              By accessing our website or purchasing live plant flora, botanical goods, or horticultural consultations from <strong>The Botanical Bazaar LLC</strong>, you agree to be bound by these Terms of Service and all applicable federal, state, and local laws.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginBottom: '0.8rem' }}>
              2. Live Plant Purchases &amp; Guarantees
            </h2>
            <p>
              Live plants are perishable living organisms. We take extreme care in packaging and preparing all specimens departing our St. Petersburg nursery.
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Arrival Guarantee:</strong> We guarantee healthy arrival on all shipped plants when transit orders are unboxed within 24 hours of delivery.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Claim Submissions:</strong> In the rare event a plant arrives damaged or stressed from transit, submit photos to{' '}
                <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>info@thebotanicalbazaar.com</a> within 48 hours for immediate replacement or store credit.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Acclimatization:</strong> Environmental variables such as local humidity, lighting, and soil moisture after arrival are the responsibility of the purchaser.
              </li>
            </ul>
          </section>

          <section style={{ background: '#123826', padding: '1.8rem', borderRadius: '12px', border: '1px solid rgba(212, 176, 106, 0.4)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              3. Fulfillment, Local Pickup &amp; Shipping
            </h2>
            <p style={{ marginTop: 0 }}>
              We offer Standard Shipping across the contiguous United States and Local Nursery Pickup in St. Petersburg, FL ($0.00 / Free). Weather holds may be initiated during freeze or high-temperature events to protect live specimens during transit.
            </p>
          </section>

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <Link
              href="/shop"
              style={{
                display: 'inline-block',
                background: '#00301E',
                color: '#D4B06A',
                border: '1px solid #D4B06A',
                padding: '0.8rem 1.8rem',
                borderRadius: '6px',
                fontFamily: 'Cinzel, serif',
                fontWeight: 'bold',
                textDecoration: 'none',
                letterSpacing: '0.05em'
              }}
            >
              Return to Shop Catalog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

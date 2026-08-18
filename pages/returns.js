import React from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Returns() {
  return (
    <>
      <Head>
        <title>Plant Care Guarantee & Refund Policy | The Botanical Bazaar</title>
        <meta
          name="description"
          content="Learn about our 100% Live Arrival Guarantee, replacement guidelines, and plant return policies at The Botanical Bazaar in St. Petersburg, FL."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/returns" />
      </Head>

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box', color: '#E9DCBE', lineHeight: '1.7' }}>
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
            Plant Care Guarantee &amp; Refund Policy
          </h1>
          <p style={{ color: '#8DA38B', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>
            Our 100% Live Arrival Commitment &bull; St. Petersburg, FL
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.05rem' }}>
          <section style={{ background: '#1C3D2E', padding: '1.8rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              100% Live Arrival Guarantee
            </h2>
            <p style={{ marginTop: 0 }}>
              At <strong>The Botanical Bazaar</strong>, we propagate and package every tropical specimen with painstaking detail. We guarantee that your plants will arrive healthy, hydrated, and ready to thrive.
            </p>
          </section>

          <section style={{ background: '#123826', padding: '1.8rem', borderRadius: '12px', border: '1px solid rgba(212, 176, 106, 0.4)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              48-Hour Claim Process
            </h2>
            <p style={{ marginTop: 0 }}>
              If your plant suffers transit shock or severe damage during shipping:
            </p>
            <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                Unbox your package within 24 hours of delivery.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                Take clear photos of the affected foliage, root ball, and shipping box.
              </li>
              <li style={{ marginBottom: 0 }}>
                Email photos and your order number to{' '}
                <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', fontWeight: 'bold' }}>
                  info@thebotanicalbazaar.com
                </a>{' '}
                within 48 hours. Our horticulturists will process a free replacement or store credit.
              </li>
            </ol>
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
              Explore Shop Catalog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

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
          content="Learn about our 100% Live Arrival Guarantee, 48-hour claim window, and plant refund guidelines at The Botanical Bazaar in St. Petersburg, FL."
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
              We grow and package every plant with extreme care so it arrives healthy and hydrated. Whether your order travels across the country with standard shipping or is handed to you at our St. Petersburg nursery, we guarantee 100% live arrival on every specimen.
            </p>
          </section>

          <section style={{ background: '#123826', padding: '1.8rem', borderRadius: '12px', border: '1px solid rgba(212, 176, 106, 0.4)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              48-Hour Claim Process &amp; Refund Guidelines
            </h2>
            <p style={{ marginTop: 0 }}>
              Living plants are sensitive to transit stresses and extreme temperature shifts. If your plant suffers severe damage or arrives in poor condition, please follow these steps:
            </p>
            <ol style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Unbox Promptly:</strong> Inspect your plants within 24 hours of delivery or local nursery pickup so your plant can breathe and receive light.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Document the Issue:</strong> Take clear, well-lit photos showing the affected foliage and root system/soil line. For shipped orders, please also include a photo of the outer shipping box. For local nursery pickup claims, shipping box photos are not required.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Submit Within 48 Hours:</strong> Email your photos and order number to{' '}
                <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', fontWeight: 'bold', textDecoration: 'underline' }}>
                  info@thebotanicalbazaar.com
                </a>{' '}
                within 48 hours of delivery or pickup. For verified Live Arrival Guarantee claims submitted within 48 hours, refunds will be issued to your <strong>original payment method</strong>. For other approved claims or post-arrival concerns, we issue <strong>store credit or a replacement plant</strong>.
              </li>
            </ol>
          </section>

          <section style={{ background: '#1C3D2E', padding: '1.8rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              What Is Covered &amp; Thermal Safeguards
            </h2>
            <p style={{ marginTop: 0 }}>
              We keep our policy transparent and fair for both growers and collectors:
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Hot &amp; Cold Weather Safeguards:</strong> During extreme cold (&lt;45°F), we automatically apply thermal wrap and heat packs. If temperatures fall below freezing (&lt;32°F) along transit routes, orders are held safely in our greenhouse. In extreme summer heat (&gt;90°F), we utilize heat-reflective packaging and dispatch routing.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Covered Claims:</strong> Severe stem breakage, root rot present upon unboxing, severe freeze/heat collapse, and lost or destroyed parcels verified by carrier tracking.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Not Covered:</strong> Minor cosmetic leaf creasing, normal transit shedding of older lower leaves, failure to unbox within 24 hours of delivery, or damage from immediate repotting into improper soil mixes.
              </li>
            </ul>
          </section>

          <section style={{ background: '#123826', padding: '1.8rem', borderRadius: '12px', border: '1px solid rgba(212, 176, 106, 0.4)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              Returns &amp; Plant Care Support
            </h2>
            <p style={{ marginTop: 0 }}>
              Because live plants cannot endure multiple return transit trips, we do not accept physical plant returns. If you experience care questions weeks or months after purchase, our experienced growers are always available at{' '}
              <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', fontWeight: 'bold', textDecoration: 'underline' }}>
                info@thebotanicalbazaar.com
              </a>{' '}
              to offer practical advice on light, soil moisture, and pest prevention.
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
              Explore Shop Catalog
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

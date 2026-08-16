import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/Button';

export default function ShippingPickup() {
  return (
    <>
      <Head>
        <title>Shipping & Local Nursery Pickup Policies | The Botanical Bazaar</title>
        <meta
          name="description"
          content="Explore Standard Shipping and Local Nursery Pickup policies from The Botanical Bazaar in St. Petersburg, FL. Secure live-plant packaging, heat packs, and weather holds for rare tropicals, aroids, and orchids."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/shipping-pickup" />
        <meta property="og:title" content="Shipping & Local Nursery Pickup Policies | The Botanical Bazaar" />
        <meta
          property="og:description"
          content="Standard Shipping and Local Nursery Pickup policies from The Botanical Bazaar in St. Petersburg, FL. Secure live-plant packaging, heat packs, and weather holds for rare tropicals, aroids, and orchids."
        />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/shipping-pickup" />
      </Head>

      <div style={{ padding: '3rem 1.5rem', maxWidth: '850px', margin: '0 auto' }}>
        <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem', fontSize: '2.4rem' }}>
          Shipping &amp; Local Nursery Pickup
        </h1>

        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', textAlign: 'center', color: '#E9DCBE', marginBottom: '2.5rem', maxWidth: '70ch', marginLeft: 'auto', marginRight: 'auto' }}>
          The Botanical Bazaar is located in St. Petersburg, Florida. We specialize in rare tropical foliage, collector aroids, specimen orchids, and medicinal plants. We offer flexible fulfillment options: <strong>Standard Shipping</strong> and <strong>Local Nursery Pickup ($0.00 / Free)</strong>.
        </p>

        {/* Policy Cards Grid */}
        <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>
          {/* Standard Shipping Box */}
          <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Standard Live Plant Shipping
            </h2>
            <ul style={{ color: '#E9DCBE', lineHeight: '1.7', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Dispatch Nursery Location:</strong> All plant shipments depart directly from our greenhouse facilities in St. Petersburg, FL.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Expert Live-Plant Packaging:</strong> Every specimen is secured with root moisture barriers, protective cardboard collars, and shock-absorbing cushioning to ensure arrival in perfect condition.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Thermal Protection &amp; Weather Holds:</strong> During cold seasons, complimentary heat packs and thermal insulation layers are added. If severe freezes or excessive heat events affect transit routes, shipments are held until safe weather windows open.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Carrier Rates &amp; Delivery Speeds:</strong> Shipping rates are calculated at checkout based on package weight, dimensions, and destination. We utilize USPS Express and UPS Ground for swift 1-3 day transit.
              </li>
            </ul>
          </div>

          {/* Local Nursery Pickup Box */}
          <div style={{ background: '#123826', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Local Nursery Pickup ($0.00 / Free)
            </h2>
            <ul style={{ color: '#E9DCBE', lineHeight: '1.7', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Convenient Scheduling:</strong> Upon checkout completion, you will receive an order confirmation email with a link to schedule your pickup appointment in St. Petersburg, FL.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Horticultural Guidance:</strong> At pickup, our guides review custom light, soil, and humidity care recommendations for your specific plants.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Live Plant Guarantee:</strong> Every plant is inspected with you at collection. We offer a full 7-day guarantee for exchange or store credit.
              </li>
            </ul>
          </div>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Button variant="gold-filled" href="/shop">Browse Catalog &amp; Shop Plants</Button>
        </div>
      </div>
    </>
  );
}

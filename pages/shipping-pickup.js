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
          content="Read our transparent shipping and local nursery pickup policies at The Botanical Bazaar in St. Petersburg, FL. Learn about secure live-plant packaging, weather holds, USDA regulations, and transit acclimatization."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/shipping-pickup" />
        <meta property="og:title" content="Shipping & Local Nursery Pickup Policies | The Botanical Bazaar" />
        <meta
          property="og:description"
          content="Read our transparent shipping and local nursery pickup policies at The Botanical Bazaar in St. Petersburg, FL. Learn about secure live-plant packaging, weather holds, USDA regulations, and transit acclimatization."
        />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/lantern.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/shipping-pickup" />
      </Head>

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box', color: '#E9DCBE', lineHeight: '1.7' }}>
        <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem', fontSize: '2.4rem' }}>
          Shipping &amp; Local Nursery Pickup
        </h1>

        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', textAlign: 'center', color: '#E9DCBE', marginBottom: '2.5rem', maxWidth: '70ch', marginLeft: 'auto', marginRight: 'auto' }}>
          At The Botanical Bazaar in St. Petersburg, Florida, we grow and curate rare tropical foliage, collector aroids, specimen orchids, and medicinal plants. We offer two transparent fulfillment options: <strong>Nationwide Live Plant Shipping</strong> and <strong>Free Local Nursery Pickup ($0.00)</strong>.
        </p>

        {/* Policy Cards Grid */}
        <div style={{ display: 'grid', gap: '2rem', marginBottom: '3rem' }}>

          {/* Standard Shipping Box */}
          <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
              Nationwide Live Plant Shipping
            </h2>
            <ul style={{ color: '#E9DCBE', lineHeight: '1.7', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Direct Greenhouse Dispatch:</strong> All orders depart directly from our St. Petersburg greenhouse using expedited carrier options like USPS Express and UPS Ground across the United States.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Custom Protective Packaging:</strong> Every specimen is secured with root moisture wrapping, protective corrugated collar supports, and shock-absorbing cushioning to prevent soil displacement and leaf breakage during transit.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Cool Weather Advisory (&lt; 45&deg;F):</strong> When destination temperatures fall below 45&deg;F, we automatically apply insulated thermal packaging and heat packs to protect tropical foliage.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Severe Cold Weather Hold (&lt; 32&deg;F):</strong> If temperatures along the transit route drop below freezing (32&deg;F), we hold your order safely in our heated greenhouse until safe thermal recovery occurs.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Calculated Shipping Rates:</strong> Transit costs are calculated transparently at checkout based on total weight, box dimensions, and delivery location.
              </li>
            </ul>
          </div>

          {/* Local Nursery Pickup Box */}
          <div style={{ background: '#123826', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(212, 176, 106, 0.4)' }}>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Free Local Nursery Pickup ($0.00)
            </h2>
            <ul style={{ color: '#E9DCBE', lineHeight: '1.7', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Ready for Pickup Timing:</strong> Ready for pickup within 24–48 hours by scheduled appointment. Once your order is prepared, you will receive an email notification with instructions to select your preferred pickup time slot at our St. Petersburg nursery.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>In-Person Inspection &amp; Advice:</strong> You inspect your plants side-by-side with our team before taking them home. Our growers share tailored advice regarding humidity, soil mix, and lighting for your home environment.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>48-Hour Guarantee:</strong> Our 100% Live Arrival Guarantee applies to local pickup items as well. Unbox and inspect your plants upon pickup, and reach out within 48 hours to <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>info@thebotanicalbazaar.com</a> for a replacement or store credit if you notice any health concerns.
              </li>
            </ul>
          </div>

          {/* USDA Regulations & Agricultural Rules Box */}
          <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              USDA Agricultural Regulations &amp; State Restrictions
            </h2>
            <p style={{ color: '#E9DCBE', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
              While we ship nationwide across the United States, shipments to states with strict USDA agricultural inspection codes (such as <strong>Hawaii, California, Texas, and Alaska</strong>) are subject to strict regulatory compliance, mandatory agricultural inspections, potential shipping delays, and weather holds to protect local plant biosecurity.
            </p>
            <p style={{ color: '#E9DCBE', lineHeight: '1.7', margin: 0 }}>
              Additionally, we comply strictly with Florida Department of Agriculture and Consumer Services (FDACS) state agricultural codes. To prevent the spread of citrus greening disease, all citrus varieties (citrus trees, citrus specimens, and regulated host plants) are restricted strictly to in-state Florida shipping or local nursery pickup. Out-of-state orders containing citrus will be canceled and issued store credit or refunded. For questions regarding agricultural regulations, contact <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>info@thebotanicalbazaar.com</a>.
            </p>
          </div>

          {/* Dedicated Transit Acclimatization & Settlement Section */}
          <div style={{ background: '#123826', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(212, 176, 106, 0.4)' }}>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
              Transit Acclimatization &amp; Settlement
            </h2>
            <p style={{ color: '#E9DCBE', lineHeight: '1.7', margin: '0 0 1rem 0' }}>
              Traveling in a dark, sealed container induces natural transit stress. Please follow our essential initial settlement guidelines upon arrival:
            </p>
            <ol style={{ color: '#E9DCBE', lineHeight: '1.7', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Prompt Unboxing (Within 24 Hours):</strong> Unpack your specimen within 24 hours of carrier delivery or nursery pickup to restore light and airflow.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Gentle Light &amp; Temperature:</strong> Place your plant in a warm area with bright, indirect light. Avoid exposing fresh unboxed foliage to direct scorching afternoon sunlight.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Hydration Check:</strong> Check root moisture. If topsoil is dry, provide a light watering with room-temperature water.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Withhold Immediate Repotting:</strong> Allow your specimen to settle in its nursery pot for 7 to 14 days before repotting or root disturbance. Immediate repotting while in transit recovery voids guarantee coverage.
              </li>
            </ol>
          </div>

        </div>

        <div style={{ textAlign: 'center' }}>
          <Button variant="gold-filled" href="/shop">Browse Catalog &amp; Shop Plants</Button>
        </div>
      </div>
    </>
  );
}

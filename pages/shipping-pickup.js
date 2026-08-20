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
          content="Read our transparent shipping and local nursery pickup policies at The Botanical Bazaar in St. Petersburg, FL. Learn about secure live-plant packaging, weather holds, and FDACS citrus rules."
        />
        <link rel="canonical" href="https://thebotanicalbazaar.com/shipping-pickup" />
        <meta property="og:title" content="Shipping & Local Nursery Pickup Policies | The Botanical Bazaar" />
        <meta
          property="og:description"
          content="Read our transparent shipping and local nursery pickup policies at The Botanical Bazaar in St. Petersburg, FL. Learn about secure live-plant packaging, weather holds, and FDACS citrus rules."
        />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/lantern.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/shipping-pickup" />
      </Head>

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '850px', margin: '0 auto', boxSizing: 'border-box', color: '#E9DCBE', lineHeight: '1.7' }}>
        <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem', fontSize: '2.4rem' }}>
          Shipping &amp; Local Nursery Pickup
        </h1>

        <p style={{ fontSize: '1.15rem', lineHeight: '1.7', textAlign: 'center', color: '#E9DCBE', marginBottom: '2.5rem', maxWidth: '70ch', marginLeft: 'auto', marginRight: 'auto' }}>
          At The Botanical Bazaar in St. Petersburg, Florida, we grow and curate rare tropical foliage, collector aroids, specimen orchids, and medicinal plants. We offer two transparent fulfillment options: <strong>Standard Live Plant Shipping (Contiguous US Only)</strong> and <strong>Free Local Nursery Pickup ($0.00)</strong>.
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
              Standard Live Plant Shipping (Contiguous US Only)
            </h2>
            <ul style={{ color: '#E9DCBE', lineHeight: '1.7', paddingLeft: '1.2rem', margin: 0 }}>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>Direct Greenhouse Dispatch:</strong> All live plant shipping orders depart directly from our St. Petersburg greenhouse to street addresses across the contiguous United States (Contiguous US only) using expedited carrier options like USPS Express and UPS Ground.
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
                <strong>Appointment Scheduling:</strong> Select local pickup at checkout. Once your order is prepared, you will receive an email confirmation with instructions to select your preferred pickup time slot at our St. Petersburg nursery.
              </li>
              <li style={{ marginBottom: '0.8rem' }}>
                <strong>In-Person Inspection &amp; Advice:</strong> You inspect your plants side-by-side with our team before taking them home. Our growers share tailored advice regarding humidity, soil mix, and lighting for your home environment.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>48-Hour Guarantee:</strong> Our 100% Live Arrival Guarantee applies to local nursery pickup items as well (photos of shipping boxes are not required for local pickup claims). Inspect your plants upon pickup, and reach out within 48 hours to <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>info@thebotanicalbazaar.com</a> if you notice any health concerns.
              </li>
            </ul>
          </div>

          {/* Agricultural Restrictions Box */}
          <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '1.5rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B06A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Agricultural Regulations &amp; Citrus Rules
            </h2>
            <p style={{ color: '#E9DCBE', lineHeight: '1.7', margin: 0 }}>
              We comply strictly with Florida Department of Agriculture and Consumer Services (FDACS) state agricultural codes. To prevent the spread of citrus greening disease, all citrus varieties (citrus trees, citrus specimens, and regulated host plants) are restricted to in-state Florida shipping or local nursery pickup. Out-of-state orders containing citrus will be canceled and refunded. For questions regarding shipping regulations, contact <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>info@thebotanicalbazaar.com</a>.
            </p>
          </div>

        </div>

        <div style={{ textAlign: 'center' }}>
          <Button variant="gold-filled" href="/shop">Browse Catalog &amp; Shop Plants</Button>
        </div>
      </div>
    </>
  );
}

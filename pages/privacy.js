import React from 'react';
import Head from 'next/head';

export default function Privacy() {
  return (
    <>
      <Head>
        <title>Privacy Policy | The Botanical Bazaar LLC</title>
        <meta
          name="description"
          content="Read the official Privacy Policy of The Botanical Bazaar LLC in St. Petersburg, Florida. Learn how we collect, store, and safeguard your data across our secure infrastructure and essential service providers."
        />
        <link rel="canonical" key="canonical" href="https://thebotanicalbazaar.com/privacy" />
      </Head>

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '860px', margin: '0 auto', boxSizing: 'border-box', color: '#E9DCBE', lineHeight: '1.7' }}>
        {/* Main Title Section */}
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
            Privacy Policy
          </h1>
          <p style={{ color: '#8DA38B', fontSize: '0.95rem', fontStyle: 'italic', margin: 0 }}>
            Effective Date: January 1, 2025 &bull; Last Revised: March 2025
          </p>
        </div>

        {/* Policy Body Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', fontSize: '1.05rem' }}>
          {/* Section 1: Overview & Entity Information */}
          <section style={{ background: '#1C3D2E', padding: '1.8rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              1. Company &amp; Entity Identification
            </h2>
            <p style={{ marginTop: 0 }}>
              The Botanical Bazaar LLC (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website located at{' '}
              <a href="https://thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>
                https://thebotanicalbazaar.com
              </a>. We are a premier tropical plant nursery based in St. Petersburg, Florida.
            </p>
            <div style={{ background: '#123826', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #D4B06A', marginTop: '1rem' }}>
              <p style={{ margin: 0, fontWeight: 'bold', color: '#F5E7C4' }}>Entity Details:</p>
              <ul style={{ margin: '0.5rem 0 0 1.2rem', padding: 0 }}>
                <li><strong>Legal Name:</strong> The Botanical Bazaar LLC</li>
                <li><strong>Location:</strong> St. Petersburg, Florida 33705, USA</li>
                <li><strong>Official Contact Email:</strong> <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A' }}>info@thebotanicalbazaar.com</a></li>
                <li><strong>Website:</strong> <a href="https://thebotanicalbazaar.com" style={{ color: '#D4B06A' }}>https://thebotanicalbazaar.com</a></li>
              </ul>
            </div>
          </section>

          {/* Section 2: Data Collection Scope */}
          <section>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginBottom: '0.8rem' }}>
              2. Information We Collect
            </h2>
            <p>
              To process order fulfillments, manage plant nursery consultations, dispatch care notifications, and deliver seamless website navigation, we collect specific personal information provided directly by you during interaction with our platform:
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>E-Commerce Checkout &amp; Shipping Data:</strong> Full customer names, physical delivery addresses, phone numbers, and billing coordinates submitted during checkout or local pickup reservations.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Contact &amp; Account Details:</strong> Email addresses collected during purchase verification, restock alerts, account creation, or customer service communications.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Newsletter Subscriptions:</strong> Voluntary email submissions for monthly nursery updates, seasonal plant guides, and workshop event invitations.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Technical &amp; Analytics Logs:</strong> Standard web server logs, IP addresses, browser types, and device telemetry used solely for site optimization and security monitoring.
              </li>
            </ul>
          </section>

          {/* Section 3: Service Providers & Infrastructure */}
          <section style={{ background: '#123826', padding: '1.8rem', borderRadius: '12px', border: '1px solid rgba(212, 176, 106, 0.4)' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              3. Service Providers &amp; Infrastructure
            </h2>
            <p style={{ marginTop: 0 }}>
              We share minimal customer data strictly with essential service providers necessary to operate our store, process orders, and communicate with you:
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0 0 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Payment &amp; Order Processing:</strong> Secure handling of transaction details and account fulfillment.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Communication Services:</strong> Dispatching order confirmations, restock notices, and care guides.
              </li>
              <li style={{ marginBottom: 0 }}>
                <strong>Hosting &amp; Security:</strong> Safe storage and encryption of store data and web infrastructure.
              </li>
            </ul>
          </section>

          {/* Section 4: Consumer Rights & Florida Resident Disclosures */}
          <section style={{ background: '#1C3D2E', padding: '1.8rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginTop: 0, marginBottom: '0.8rem' }}>
              4. Consumer Rights &amp; Florida State Disclosures
            </h2>
            <p>
              As a business operating out of St. Petersburg, Florida, The Botanical Bazaar LLC honors all applicable state and federal consumer privacy protections. All site visitors and Florida residents have explicit rights regarding their personal data:
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0.8rem 0' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Right to Access:</strong> You may request a record of the specific personal information we have collected and stored about you.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Right to Rectification:</strong> You may request that we update, correct, or amend any inaccurate personal data.
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Right to Deletion:</strong> You may request complete erasure of your personal records from our databases and connected service providers (subject to statutory tax retention obligations).
              </li>
            </ul>
            <div style={{ background: '#123826', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(212, 176, 106, 0.3)', marginTop: '1rem' }}>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                To exercise any of these privacy rights, please submit your request via email to{' '}
                <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', fontWeight: 'bold', textDecoration: 'underline' }}>
                  info@thebotanicalbazaar.com
                </a>. We verify and respond to all requests within 30 business days.
              </p>
            </div>
          </section>

          {/* Section 5: Cookies & Data Retention */}
          <section>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.5rem', marginBottom: '0.8rem' }}>
              5. Cookies &amp; Data Security
            </h2>
            <p>
              We utilize essential browser session cookies and local storage tokens (`localStorage`) to preserve your active shopping cart contents, saved wishlist items, and preferred USDA hardiness climate zone. You may clear your browser cookies and storage cache at any time using your browser settings.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}

import Head from 'next/head';
import React from 'react';
import Button from '../components/Button';

export default function FAQ() {
  const faqs = [
    {
      q: 'Where are you located?',
      a: 'We are situated in beautiful St. Petersburg, Florida. Our nursery address and pickup coordination instructions are sent once your order checkout completes successfully.'
    },
    {
      q: 'Do you ship live plants nationwide?',
      a: 'Yes! We ship robust live plants nationwide across the United States with specialized thermal insulation tailored to destination weather. Shipments to states with strict USDA agricultural codes (such as Hawaii, California, Texas, and Alaska) are subject to strict compliance, potential inspection delays, and weather holds.'
    },
    {
      q: 'What is your 100% live plant guarantee?',
      a: 'We guarantee 100% healthy live arrival. If a specimen arrives damaged, notify us at info@thebotanicalbazaar.com within 48 hours of carrier delivery timestamp or pickup with clear photos for a prompt replacement plant or store credit.'
    },
    {
      q: 'How should I handle my plant upon arrival?',
      a: 'Unbox your plant within 24 hours of delivery or pickup, place it in bright indirect light, check topsoil moisture, and allow it to acclimate for 7 to 14 days before attempting repotting.'
    }
  ];

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <Head>
        <title>Frequently Asked Questions | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Answers to common questions about ordering, nationwide shipping, USDA regulations, local nursery pickup, live plant guarantee, and acclimatization." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/faq" />
        <meta property="og:title" content="Frequently Asked Questions | The Botanical Bazaar St. Petersburg FL" />
        <meta property="og:description" content="Answers to common questions about ordering, nationwide shipping, local nursery pickup, and tropical plant care." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/faq" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '2.5rem' }}>Frequently Asked Questions</h1>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: '#1C3D2E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h3 style={{ color: '#D4B06A', margin: '0 0 0.8rem 0', fontFamily: 'Cinzel, serif' }}>{faq.q}</h3>
            <p style={{ margin: 0, lineHeight: '1.6' }}>{faq.a}</p>
          </div>
        ))}
      </div>

      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Still have specific horticultural or order queries?</p>
        <Button variant="gold-filled" href="/contact">Get in Touch</Button>
      </div>
    </div>
  );
}

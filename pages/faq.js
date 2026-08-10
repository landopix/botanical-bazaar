import React from 'react';
import Button from '../components/Button';

export default function FAQ() {
  const faqs = [
    { q: 'Where are you located?', a: 'All sales are strictly local pickup in St. Petersburg, FL. The precise nursery location and appointment address will be provided upon inquiry or order confirmation.' },
    { q: 'Do you ship live plants?', a: 'No. All sales are strictly local pickup in St. Petersburg, FL. The precise nursery location and appointment address will be provided upon inquiry or order confirmation.' },
    { q: 'What is your live plant guarantee?', a: 'We guarantee our plants are perfectly healthy, robust, and correctly identified at the time of pickup. Guides are happy to review care guidelines with you before you leave!' }
  ];

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>Frequently Asked Questions</h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '2.5rem', color: '#E9DCBE' }}>
        For general inquiries and business information, reach out to us at <a href="mailto:info@thebotanicalbazaar.com" style={{ color: '#D4B06A', textDecoration: 'underline' }}>info@thebotanicalbazaar.com</a>.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {faqs.map((faq, i) => (
          <div key={i} style={{ background: '#1C3D2E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
            <h3 style={{ color: '#D4B06A', margin: '0 0 0.8rem 0', fontFamily: 'Cinzel, serif' }}>🌱 {faq.q}</h3>
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

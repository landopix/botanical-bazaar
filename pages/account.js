import React, { useEffect } from 'react';
import Head from 'next/head';

export default function Account() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = 'https://the-botanical-bazaar.myshopify.com/account/login';
    }
  }, []);

  return (
    <div style={{ padding: '5rem 1.5rem', textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Head>
        <title>Customer Account Portal | The Botanical Bazaar</title>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginBottom: '1rem', fontSize: '1.8rem' }}>
        Redirecting to Shopify Customer Portal...
      </h1>
      <p style={{ color: '#E9DCBE', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '500px', lineHeight: '1.6' }}>
        Customer account management and order tracking are hosted directly on our official Shopify customer portal.
      </p>
      <a
        href="https://the-botanical-bazaar.myshopify.com/account/login"
        style={{
          display: 'inline-block',
          padding: '0.8rem 1.8rem',
          backgroundColor: '#D4B06A',
          color: '#00301E',
          fontWeight: 'bold',
          borderRadius: '24px',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
      >
        Click here if you are not redirected automatically &rarr;
      </a>
    </div>
  );
}

const SHOPIFY_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN || 'the-botanical-bazaar.myshopify.com';
const LOGIN_URL = `https://${SHOPIFY_DOMAIN.replace(/^https?:\/\//, '').replace(/\/$/, '')}/account/login`;
import React, { useEffect } from 'react';
import Head from 'next/head';

export default function Account() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.location.href = LOGIN_URL;
    }
  }, []);

  const fetchOrders = async (email) => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleMagicLinkSubmit = async (e) => {
    e.preventDefault();
    if (!magicEmail || !magicEmail.includes('@')) {
      setMagicError('Please enter a valid email address.');
      return;
    }

    setMagicLoading(true);
    setMagicError('');

    try {
      const res = await fetch('/api/inquiry/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: magicEmail,
          customerName: 'Account User',
          inquiryType: 'magic_link_auth',
          subject: 'Passwordless Account Access Request',
          message: `Magic link access request for ${magicEmail}`
        })
      });

      if (res.ok) {
        setMagicSent(true);
        localStorage.setItem('bb_user_email', magicEmail.trim());
        setUserEmail(magicEmail.trim());
      } else {
        const data = await res.json();
        setMagicError(data.error || 'Failed to send login link.');
      }
    } catch (err) {
      setMagicError('An unexpected error occurred. Please try again.');
    } finally {
      setMagicLoading(false);
    }
  };

  const handleOrderLookup = async (e) => {
    e.preventDefault();
    setLookupError('');

    const cleanOrder = orderNumber.trim();
    const cleanEmail = lookupEmail.trim();

    if (!cleanOrder) {
      setLookupError('Please enter a valid Order Number (e.g. #1001).');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLookupError('Please enter a valid Email Address associated with your order.');
      return;
    }

    setIsSearching(true);

    try {
      const res = await fetch('/api/order-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: cleanOrder, email: cleanEmail })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.targetUrl) {
          window.location.href = data.targetUrl;
        } else {
          setLookupError('Unable to locate order. Please check your order details.');
        }
      } else {
        const data = await res.json();
        setLookupError(data.error || 'Unable to locate order status.');
      }
    } catch (err) {
      setLookupError('An unexpected error occurred while looking up your order. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('bb_user_email');
    setUserEmail('');
    setOrders([]);
    setMagicSent(false);
  };

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
        href={LOGIN_URL}
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

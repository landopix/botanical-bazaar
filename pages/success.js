import React, { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Script from 'next/script';
import Button from '../components/Button';
import { useCart } from '../context/CartContext';

export default function Success() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [isValidOrder, setIsValidOrder] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [orderId, setOrderId] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Calculate estimated delivery date strictly in YYYY-MM-DD format (today + 5 calendar days)
  const estimatedDeliveryDate = useMemo(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (!router.isReady) return;

    const { checkout_id, order_id, email } = router.query;
    const resolvedOrderId = typeof order_id === 'string' && order_id.trim()
      ? order_id.trim()
      : (typeof checkout_id === 'string' && checkout_id.trim() ? checkout_id.trim() : '');

    const resolvedEmail = typeof email === 'string' && email.trim() ? email.trim() : '';

    if (resolvedOrderId) {
      setIsValidOrder(true);
      setOrderId(resolvedOrderId);
      if (resolvedEmail) {
        setCustomerEmail(resolvedEmail);
      }
      clearCart();
    } else {
      setIsValidOrder(false);
    }
    setIsChecking(false);
  }, [router.isReady, router.query]);

  // Global window.renderOptIn callback for Google platform.js script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.renderOptIn = function () {
      if (
        window.gapi &&
        window.gapi.surveyoptin &&
        typeof window.gapi.surveyoptin.render === 'function' &&
        orderId &&
        customerEmail
      ) {
        try {
          window.gapi.surveyoptin.render({
            merchant_id: 5843329915,
            order_id: orderId,
            email: customerEmail,
            delivery_country: 'US',
            estimated_delivery_date: estimatedDeliveryDate
          });
        } catch (err) {
          console.error('Google surveyoptin render error:', err);
        }
      }
    };

    // If gapi is already present and loaded, attempt rendering
    if (
      window.gapi &&
      window.gapi.surveyoptin &&
      typeof window.gapi.surveyoptin.render === 'function' &&
      orderId &&
      customerEmail
    ) {
      window.renderOptIn();
    }
  }, [orderId, customerEmail, estimatedDeliveryDate]);

  if (isChecking) {
    return (
      <div style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto', color: '#F5E7C4', fontFamily: 'Crimson Text, serif' }}>
        <p style={{ fontSize: '1.2rem' }}>Verifying order session...</p>
      </div>
    );
  }

  if (!isValidOrder) {
    return (
      <>
        <Head>
          <title>Order Session Not Found | The Botanical Bazaar</title>
        </Head>
        <div style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto', fontFamily: 'Crimson Text, serif' }}>
          <h1 style={{ color: '#D4B06A', fontSize: '2.5rem', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem', textTransform: 'uppercase' }}>
            No Active Order Session Found
          </h1>
          <p style={{ color: '#F4F1E1', fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            No active order session or checkout parameter was detected. If you recently completed a checkout, please check your email for confirmation or return to our shop catalog.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button variant="gold-filled" href="/shop">Return to Shop</Button>
            <Button variant="outline" href="/cart" rel="nofollow">View Your Cart</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Order Confirmed | The Botanical Bazaar</title>
      </Head>

      {/* Conditionally load Google Customer Reviews Opt-In script only when email is present */}
      {Boolean(customerEmail && orderId) && (
        <Script
          id="google-opt-in-script"
          src="https://apis.google.com/js/platform.js?onload=renderOptIn"
          strategy="afterInteractive"
        />
      )}

      <div style={{ padding: '6rem 1.5rem', textAlign: 'center', maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ color: '#D4B06A', fontSize: '3rem', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem' }}>Order Successful!</h1>
        <h2 style={{ color: '#F4F1E1', margin: '0 0 1rem 0' }}>Thank you for growing with us!</h2>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.6', marginBottom: '2.5rem' }}>
          We have secured your selected tropical plant companions! Our nursery guides are preparing your collection. We will email or text you shortly to coordinate your personalized local pickup slot in St. Petersburg, FL.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button variant="gold-filled" href="/account">Go to Customer Account</Button>
          <Button variant="outline" href="/shop">Browse More Catalog</Button>
        </div>
      </div>
    </>
  );
}

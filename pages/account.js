import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';

export default function Account() {
  const { wishlist, removeFromWishlist } = useWishlist();

  // Climate zone state
  const [hardinessZone, setHardinessZone] = useState('10a');

  // Passwordless magic link form state
  const [magicEmail, setMagicEmail] = useState('');
  const [magicSent, setMagicSent] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const [magicError, setMagicError] = useState('');

  // Guest Order Tracker state
  const [orderNumber, setOrderNumber] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Local saved session user email
  const [userEmail, setUserEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('bb_user_email');
      if (savedEmail) {
        setUserEmail(savedEmail);
        fetchOrders(savedEmail);
      }

      const savedZone = localStorage.getItem('user_hardiness_zone');
      if (savedZone) {
        setHardinessZone(savedZone);
      }

      const handleZoneUpdated = () => {
        const updated = localStorage.getItem('user_hardiness_zone');
        if (updated) {
          setHardinessZone(updated);
        }
      };

      window.addEventListener('user_hardiness_zone_updated', handleZoneUpdated);
      return () => {
        window.removeEventListener('user_hardiness_zone_updated', handleZoneUpdated);
      };
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

  const handleOrderLookup = (e) => {
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

    setTimeout(() => {
      const lookupEndpoint = 'https://thebotanicalbazaar.com/apps/order-lookup';
      const targetUrl = `${lookupEndpoint}?order=${encodeURIComponent(cleanOrder)}&email=${encodeURIComponent(cleanEmail)}`;
      window.location.href = targetUrl;
    }, 800);
  };

  const handleSignOut = () => {
    localStorage.removeItem('bb_user_email');
    setUserEmail('');
    setOrders([]);
    setMagicSent(false);
  };

  return (
    <>
      <Head>
        <title>Account & Order Tracking | The Botanical Bazaar</title>
        <meta
          name="description"
          content="Access your Botanical Bazaar account via passwordless sign-in, track guest plant orders, view saved wishlist items, and manage climate hardiness settings."
        />
      </Head>

      <div style={{ padding: '3.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto', boxSizing: 'border-box', fontFamily: 'Crimson Text, serif' }}>
        {/* Header Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1
            style={{
              color: '#D4B06A',
              fontFamily: 'Cinzel, serif',
              fontSize: '2.6rem',
              letterSpacing: '0.08em',
              marginBottom: '0.6rem',
              textTransform: 'uppercase'
            }}
          >
            Account &amp; Order Tracking
          </h1>
          <p style={{ color: '#E9DCBE', fontSize: '1.15rem', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            Guest checkout remains primary for all nursery purchases. Use our passwordless email authentication or guest tracker below to manage your order details.
          </p>
        </div>

        {/* Climate Zone & Local Session Bar */}
        <div
          style={{
            background: '#123826',
            border: '1px solid #D4B06A',
            borderRadius: '12px',
            padding: '1.2rem 1.8rem',
            marginBottom: '2.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#D4B06A', fontWeight: 'bold', fontFamily: 'Cinzel, serif', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              My Climate Zone:
            </span>
            <button
              onClick={() => {
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new Event('open_zone_modal'));
                }
              }}
              className="zone-pill-btn"
              aria-label="Select USDA climate hardiness zone"
              style={{
                background: '#1C3D2E',
                border: '1px solid #D4B06A',
                color: '#F5E7C4',
                padding: '0.4rem 0.9rem',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.9rem'
              }}
            >
              Zone {hardinessZone} ▾
            </button>
          </div>

          {userEmail ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ color: '#E9DCBE', fontSize: '0.95rem' }}>
                Signed in as: <strong style={{ color: '#D4B06A' }}>{userEmail}</strong>
              </span>
              <button
                onClick={handleSignOut}
                style={{
                  background: 'transparent',
                  border: '1px solid #D4B06A',
                  color: '#D4B06A',
                  padding: '0.35rem 0.8rem',
                  borderRadius: '16px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <span style={{ color: '#8DA38B', fontSize: '0.9rem', fontStyle: 'italic' }}>
              Guest session active (No account required)
            </span>
          )}
        </div>

        {/* Top Split: Section 1 (Passwordless Auth) & Section 2 (Guest Order Tracker) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            marginBottom: '3.5rem'
          }}
        >
          {/* Section 1: Passwordless Auth Portal */}
          <div
            style={{
              background: '#1C3D2E',
              border: '1px solid #D4B06A',
              borderRadius: '16px',
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <div>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.6rem', marginTop: 0, marginBottom: '0.8rem' }}>
                Passwordless Access
              </h2>
              <p style={{ color: '#E9DCBE', fontSize: '0.98rem', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                Enter your email address to receive a secure passwordless sign-in link. No password required.
              </p>

              {!magicSent ? (
                <form onSubmit={handleMagicLinkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', color: '#F5E7C4', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="nursery@example.com"
                      value={magicEmail}
                      onChange={(e) => setMagicEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.8rem',
                        borderRadius: '8px',
                        border: '1px solid #D4B06A',
                        backgroundColor: '#123826',
                        color: '#F4F1E1',
                        fontSize: '0.95rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {magicError && (
                    <div style={{ color: '#ff8a8a', fontSize: '0.85rem', backgroundColor: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ff8a8a' }}>
                      {magicError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="gold-filled"
                    disabled={magicLoading}
                    style={{ width: '100%', padding: '0.85rem' }}
                  >
                    {magicLoading ? 'Sending Link...' : 'Send Magic Access Link'}
                  </Button>
                </form>
              ) : (
                <div style={{ background: 'rgba(212,176,106,0.15)', border: '1px solid #D4B06A', borderRadius: '8px', padding: '1rem', color: '#D4B06A', textAlign: 'center' }}>
                  <strong>Check your inbox!</strong> We sent a login link to <em>{magicEmail}</em>.
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Guest Order Tracker */}
          <div
            style={{
              background: '#1C3D2E',
              border: '1px solid #D4B06A',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}
          >
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.6rem', marginTop: 0, marginBottom: '0.8rem' }}>
              Track Guest Order
            </h2>
            <p style={{ color: '#E9DCBE', fontSize: '0.98rem', lineHeight: '1.5', marginBottom: '1.2rem' }}>
              Checked out as a guest? Enter your order number and email address below to fetch real-time carrier tracking and fulfillment status.
            </p>

            <form onSubmit={handleOrderLookup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', color: '#F5E7C4', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                  Order Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. #1001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D4B06A',
                    backgroundColor: '#123826',
                    color: '#F4F1E1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#F5E7C4', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="nursery@example.com"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.7rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #D4B06A',
                    backgroundColor: '#123826',
                    color: '#F4F1E1',
                    fontSize: '0.95rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {lookupError && (
                <div style={{ color: '#ff8a8a', fontSize: '0.85rem', backgroundColor: 'rgba(255,0,0,0.1)', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ff8a8a' }}>
                  {lookupError}
                </div>
              )}

              <Button
                type="submit"
                variant="gold-filled"
                disabled={isSearching}
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.85rem' }}
              >
                {isSearching ? 'Locating Order Status...' : 'Track Order Status'}
              </Button>
            </form>
          </div>
        </div>

        {/* Section 3: Saved Items & Order History */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Saved Items / Wishlist Section */}
          <div
            style={{
              background: '#123826',
              border: '1px solid #D4B06A',
              borderRadius: '16px',
              padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.8rem', margin: 0 }}>
                Saved Botanical Goods ({wishlist.length})
              </h2>
              {wishlist.length > 0 && (
                <Link href="/wishlist" style={{ color: '#D4B06A', textDecoration: 'underline', fontSize: '0.95rem' }}>
                  View Full Wishlist Sanctuary &rarr;
                </Link>
              )}
            </div>

            {wishlist.length === 0 ? (
              <div
                style={{
                  background: '#1C3D2E',
                  padding: '2.5rem 1.5rem',
                  borderRadius: '12px',
                  border: '1px dashed #D4B06A',
                  textAlign: 'center'
                }}
              >
                <p style={{ color: '#E9DCBE', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>
                  Your saved botanical list is currently empty.
                </p>
                <p style={{ color: '#8DA38B', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
                  Explore our live tropical plant catalog and tap the heart icon on any product to save items for future reference.
                </p>
                <Button variant="outline" href="/shop">
                  Explore Nursery Catalog
                </Button>
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '1.5rem'
                }}
              >
                {wishlist.map((item) => {
                  const resolvedImg = item.image
                    ? item.image.startsWith('http') || item.image.startsWith('/')
                      ? item.image
                      : '/' + item.image
                    : '/assets/placeholder.png';

                  return (
                    <div
                      key={item.slug}
                      style={{
                        background: '#1C3D2E',
                        border: '1px solid #D4B06A',
                        borderRadius: '10px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div style={{ position: 'relative', width: '100%', height: '160px', borderRadius: '8px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                        <img
                          src={resolvedImg}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div>
                        <h4 style={{ fontFamily: 'Cinzel, serif', color: '#D4B06A', fontSize: '1.05rem', margin: '0 0 0.3rem 0' }}>
                          {item.name}
                        </h4>
                        <div style={{ color: '#F5E7C4', fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '0.8rem' }}>
                          ${item.price ? Number(item.price).toFixed(2) : 'N/A'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          href={`/product/${item.slug}`}
                          style={{
                            flex: 1,
                            textAlign: 'center',
                            background: '#D4B06A',
                            color: '#00301E',
                            padding: '0.4rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            textDecoration: 'none'
                          }}
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => removeFromWishlist(item.slug)}
                          aria-label={`Remove ${item.name} from saved items`}
                          style={{
                            background: 'transparent',
                            border: '1px solid #ff8a8a',
                            color: '#ff8a8a',
                            borderRadius: '6px',
                            padding: '0.4rem 0.6rem',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

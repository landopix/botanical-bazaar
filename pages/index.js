import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../components/Button';

export default function Index() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="home-container">
      {/* Hero section */}
      <section className="hero" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '2rem', gap: '2rem' }}>
        <div className="hero-text">
          <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>The Botanical Bazaar</h1>
          <p style={{ fontSize: '2rem', lineHeight: '1.4', margin: '0.4rem 0 0.8rem 0', fontFamily: 'Cinzel, serif' }}>
            Rooted in Beauty.<br />Grown for You.
          </p>
          <p style={{ fontSize: '1.1rem', margin: '0.5rem 0 1.5rem 0', maxWidth: '30ch', lineHeight: '1.4', marginLeft: 'auto', marginRight: 'auto' }}>
            Rare and resilient tropical plants, curated in St.&nbsp;Petersburg, FL - lovingly grown for our community and beyond.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button variant="gold-filled" href="/shop">Shop the Store</Button>
            <Button variant="outline" href="/consultations">Book a Consultation</Button>
          </div>
        </div>

        {/* Hero image with animated GIF */}
        <div className="hero-image" style={{ width: '45%', maxWidth: '400px', margin: '1rem auto' }}>
          <img
            src="/assets/logo-animation-optimized.gif"
            alt="The Botanical Bazaar Animated Logo"
            style={{ width: '100%', height: 'auto', borderRadius: '12px' }}
          />
        </div>

        {/* Almanac Signup Inside Hero */}
        <div className="almanac-hero" style={{ width: '100%', maxWidth: '600px', marginTop: '1rem', textAlign: 'center' }}>
          <h2 style={{ color: '#D4B06A', marginBottom: '0.4rem', fontFamily: 'Cinzel, serif' }}>The Almanac</h2>
          <Link href="/garden-month" style={{ display: 'block', color: '#E9DCBE', textDecoration: 'none', fontStyle: 'italic', marginBottom: '0.3rem' }}>
            This Month in the Garden
          </Link>
          <Link href="/zones" style={{ display: 'block', color: '#E9DCBE', textDecoration: 'none', marginBottom: '1rem' }}>
            Best Plants for Your Zone
          </Link>
          <div className="almanac-signup-inner" style={{ background: '#123826', color: '#F5E7C4', padding: '1.5rem', margin: '1rem auto', borderRadius: '12px', maxWidth: '600px', textAlign: 'center', boxShadow: '0 3px 14px rgba(20,40,30,0.10)', border: '1px solid #D4B06A' }}>
            <h3 style={{ color: '#D4B06A', marginTop: '0', marginBottom: '0.5rem', fontFamily: 'Cinzel, serif' }}>Join Our Almanac</h3>
            <p style={{ margin: '0.5rem auto 1rem auto', maxWidth: '500px', fontSize: '1.05rem', lineHeight: '1.4' }}>
              Subscribe to receive seasonal gardening tips, new plant arrivals and exclusive offers directly to your inbox.
            </p>
            {subscribed ? (
              <p style={{ color: '#D4B06A', fontWeight: 'bold' }}>Thank you! You are now subscribed to the Almanac.</p>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.6rem', maxWidth: '500px', margin: '0 auto' }}>
                <input
                  type="email"
                  placeholder="Your email address"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ flex: 1, minWidth: '200px', padding: '0.5rem 0.8rem', borderRadius: '8px', border: '1px solid #749c7f', background: '#F5E7C4', color: '#1C3D2E', fontFamily: 'inherit', fontSize: '1rem' }}
                />
                <Button type="submit" variant="gold-filled">Subscribe</Button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Local Pickup Banner */}
      <div className="pickup-banner" style={{ background: '#D4B06A', color: '#1C3D2E', padding: '0.8rem 1.2rem', margin: '2rem auto', borderRadius: '10px', maxWidth: '800px', fontSize: '1rem', textAlign: 'center' }}>
        <strong>Local Pickup Only</strong>&nbsp;–&nbsp;Our plants are available for pick&nbsp;up in St.&nbsp;Petersburg, FL. We do not ship live plants at this time.
      </div>

      {/* Shop Categories Grid */}
      <section className="shop-categories" style={{ padding: '2rem 1.5rem' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', color: '#D4B06A', fontFamily: 'Cinzel, serif' }}>Browse by Category</h2>
        <div className="categories-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', justifyContent: 'center' }}>
          <Link href="/shop" style={{ textDecoration: 'none', color: '#1C3D2E', background: '#F5E7C4', padding: '1.2rem 1.6rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }}>Shop All</Link>
          <Link href="/shop?category=herbs-medicinal" style={{ textDecoration: 'none', color: '#1C3D2E', background: '#F5E7C4', padding: '1.2rem 1.6rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }}>Herbs &amp; Medicinal</Link>
          <Link href="/shop?category=fruit-trees" style={{ textDecoration: 'none', color: '#1C3D2E', background: '#F5E7C4', padding: '1.2rem 1.6rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }}>Fruit Trees</Link>
          <Link href="/shop?category=houseplants" style={{ textDecoration: 'none', color: '#1C3D2E', background: '#F5E7C4', padding: '1.2rem 1.6rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }}>Houseplants</Link>
          <Link href="/shop?category=seeds" style={{ textDecoration: 'none', color: '#1C3D2E', background: '#F5E7C4', padding: '1.2rem 1.6rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }}>Seeds</Link>
          <Link href="/zones" style={{ textDecoration: 'none', color: '#1C3D2E', background: '#F5E7C4', padding: '1.2rem 1.6rem', borderRadius: '12px', fontWeight: 'bold', boxShadow: '0 3px 14px rgba(0,0,0,0.1)' }}>Best Plants for Your Zone</Link>
        </div>
      </section>

      {/* Book Consult Section */}
      <section style={{ backgroundColor: '#D4B06A', padding: '3rem 2rem', margin: '3rem auto', textAlign: 'center', borderRadius: '12px', color: '#1C3D2E', maxWidth: '800px', position: 'relative' }}>
        <h2 style={{ fontFamily: 'Cinzel, serif', margin: '0 0 1rem 0' }}>Book Time with a Plant Guide</h2>
        <p style={{ fontSize: '1.1rem', margin: '0 0 2rem 0', maxWidth: '50ch', marginLeft: 'auto', marginRight: 'auto' }}>
          Schedule an in-person, local horticultural consultation with our experienced nursery guides. We will help curate the ultimate resilient companion package for your yard.
        </p>
        <Button variant="green-filled" href="/consultations">Book a Consultation</Button>
      </section>
    </div>
  );
}

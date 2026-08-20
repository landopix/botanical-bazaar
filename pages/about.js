import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import { sanityClient } from '../lib/sanity';

export async function getStaticProps() {
  let aboutData = null;
  try {
    if (sanityClient) {
      const query = `*[_type == "aboutPage"][0]{ title, subtitle, storyHeading, storyParagraph1, storyParagraph2, "bannerImageUrl": bannerImage.asset->url, "logoImageUrl": logoImage.asset->url, features }`;
      const cmsData = await sanityClient.fetch(query);
      if (cmsData && cmsData.title) {
        aboutData = cmsData;
      }
    }
  } catch (err) {
    console.warn("Sanity fetch failed for aboutPage:", err.message);
  }

  return {
    props: {
      aboutData
    },
    revalidate: 60
  };
}

export default function AboutPage({ aboutData }) {
  return (
    <div style={{ background: '#00301E', minHeight: '100vh', padding: '3rem 1.5rem', color: '#E9DCBE' }}>
      <Head>
        <title>About Us | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Learn about The Botanical Bazaar LLC in St. Petersburg, FL—our tropical plant propagation philosophy, rare collector orchids, and local nursery history." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/about" />
        <meta property="og:title" content="About Us | The Botanical Bazaar" />
        <meta property="og:description" content="Learn about our tropical plant nursery and rare flora collection in St. Petersburg, FL." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {aboutData ? (
          <>
            {/* Header Hero */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              {aboutData.logoImageUrl && (
                <img
                  src={aboutData.logoImageUrl}
                  alt="The Botanical Bazaar Emblem"
                  style={{ height: '80px', marginBottom: '1rem', objectFit: 'contain' }}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
              <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
                {aboutData.title}
              </h1>
              {aboutData.subtitle && (
                <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#F5E7C4', maxWidth: '700px', margin: '0 auto' }}>
                  {aboutData.subtitle}
                </p>
              )}
              <div style={{ width: '80px', height: '2px', background: '#D4B06A', margin: '1.5rem auto 0' }}></div>
            </div>

            {/* Feature Banner */}
            {aboutData.bannerImageUrl && (
              <div style={{
                width: '100%',
                height: '320px',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid #D4B06A',
                marginBottom: '3rem',
                background: '#001F14',
                position: 'relative'
              }}>
                <img
                  src={aboutData.bannerImageUrl}
                  alt="The Botanical Bazaar Nursery Banner"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Story Section */}
            <div style={{
              background: '#1C3D2E',
              borderRadius: '12px',
              border: '1px solid #D4B06A',
              padding: '2.5rem',
              marginBottom: '3rem'
            }}>
              {aboutData.storyHeading && (
                <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.2rem' }}>
                  {aboutData.storyHeading}
                </h2>
              )}
              {aboutData.storyParagraph1 && (
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#F5E7C4', marginBottom: '1.5rem' }}>
                  {aboutData.storyParagraph1}
                </p>
              )}
              {aboutData.storyParagraph2 && (
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#F5E7C4', margin: 0 }}>
                  {aboutData.storyParagraph2}
                </p>
              )}
            </div>

            {/* Features Grid */}
            {aboutData.features && aboutData.features.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.8rem',
                marginBottom: '3.5rem'
              }}>
                {aboutData.features.map((feat, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#123826',
                      borderRadius: '10px',
                      border: '1px solid rgba(212, 176, 106, 0.4)',
                      padding: '1.8rem'
                    }}
                  >
                    <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.2rem', marginTop: 0, marginBottom: '0.8rem' }}>
                      {feat.title}
                    </h3>
                    <p style={{ color: '#F5E7C4', fontSize: '0.98rem', lineHeight: '1.6', margin: 0 }}>
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Call to Action */}
            <div style={{ textAlign: 'center', background: '#1C3D2E', padding: '2.5rem', borderRadius: '12px', border: '1px solid #D4B06A' }}>
              <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.5rem', marginTop: 0, marginBottom: '1rem' }}>
                Ready to Explore Our Plant Collection?
              </h3>
              <p style={{ color: '#F5E7C4', fontSize: '1.1rem', marginBottom: '1.8rem' }}>
                Browse our catalog of acclimated tropical plants or schedule a personal horticultural consultation.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="gold-filled" href="/shop">Browse Store</Button>
                <Button variant="outline" href="/consultations">Book Consultation</Button>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            background: '#00301E',
            border: '1px solid #D4B06A',
            borderRadius: '12px',
            padding: '4rem 2rem',
            textAlign: 'center',
            margin: '3rem auto',
            maxWidth: '650px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#D4B06A' }}>🌿</div>
            <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '2.2rem', marginTop: 0, marginBottom: '1rem', letterSpacing: '0.05em' }}>
              New Botanical Updates Coming Soon!
            </h1>
            <p style={{ color: '#E9DCBE', fontSize: '1.15rem', margin: '0 0 2rem 0', lineHeight: '1.6' }}>
              Our nursery history and story content is being refreshed in our CMS database. In the meantime, explore our acclimated tropical plant collection.
            </p>
            <Button variant="gold-filled" href="/shop">Browse Store</Button>
          </div>
        )}
      </div>
    </div>
  );
}

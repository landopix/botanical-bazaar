import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import { sanityClient } from '../lib/sanity';

const DEFAULT_ABOUT_DATA = {
  title: 'Our Mercantile History & Botanical Mission',
  subtitle: 'Cultivating resilient biodiversity in St. Petersburg, Florida',
  storyHeading: 'The Botanical Bazaar Story',
  storyParagraph1: 'At The Botanical Bazaar LLC, our primary mission is to make resilient, rare tropical plants accessible and understandable for the local St. Petersburg, Florida community and beyond.',
  storyParagraph2: 'We lovingly propagate and nurture a curated catalog of highly-desired species—including spectacular Aroids, hard-to-find tropical fruit trees, robust medicinal herbs, and award-winning collector orchids.',
  bannerImageUrl: '/assets/brand-banner.png',
  logoImageUrl: '/assets/lantern.png',
  features: [
    {
      title: 'Acclimated Local Varieties',
      description: 'Every plant is grown and tested for real-world resilience in USDA Zone 9b/10a weather patterns.'
    },
    {
      title: 'Ethical & Organic Propagation',
      description: 'We practice sustainable, pesticide-free horticulture to support beneficial pollinators and soil health.'
    },
    {
      title: 'Expert Horticultural Support',
      description: 'Our nursery guides offer tailored advice on lighting, soil mixing, and winter cold hardiness protection.'
    }
  ]
};

export async function getStaticProps() {
  let aboutData = DEFAULT_ABOUT_DATA;
  try {
    if (sanityClient) {
      const query = `*[_type == "aboutPage"][0]{ title, subtitle, storyHeading, storyParagraph1, storyParagraph2, "bannerImageUrl": bannerImage.asset->url, "logoImageUrl": logoImage.asset->url, features }`;
      const cmsData = await sanityClient.fetch(query);
      if (cmsData && cmsData.title) {
        aboutData = { ...DEFAULT_ABOUT_DATA, ...cmsData };
      }
    }
  } catch (err) {
    console.warn("Sanity fetch failed for aboutPage, falling back to local dataset:", err.message);
  }

  return {
    props: {
      aboutData
    },
    revalidate: 60
  };
}

export default function AboutPage({ aboutData }) {
  const data = aboutData || DEFAULT_ABOUT_DATA;

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
        {/* Header Hero */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <img
            src={data.logoImageUrl || '/assets/lantern.png'}
            alt="The Botanical Bazaar Emblem"
            style={{ height: '80px', marginBottom: '1rem', objectFit: 'contain' }}
            onError={(e) => { e.target.src = '/assets/lantern.png'; }}
          />
          <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
            {data.title}
          </h1>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#F5E7C4', maxWidth: '700px', margin: '0 auto' }}>
            {data.subtitle}
          </p>
          <div style={{ width: '80px', height: '2px', background: '#D4B06A', margin: '1.5rem auto 0' }}></div>
        </div>

        {/* Feature Banner */}
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
            src={data.bannerImageUrl || '/assets/brand-banner.png'}
            alt="The Botanical Bazaar Nursery Banner"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/assets/brand-banner.png'; }}
          />
        </div>

        {/* Story Section */}
        <div style={{
          background: '#1C3D2E',
          borderRadius: '12px',
          border: '1px solid #D4B06A',
          padding: '2.5rem',
          marginBottom: '3rem'
        }}>
          <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.8rem', marginTop: 0, marginBottom: '1.2rem' }}>
            {data.storyHeading}
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#F5E7C4', marginBottom: '1.5rem' }}>
            {data.storyParagraph1}
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#F5E7C4', margin: 0 }}>
            {data.storyParagraph2}
          </p>
        </div>

        {/* Features Grid */}
        {data.features && data.features.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.8rem',
            marginBottom: '3.5rem'
          }}>
            {data.features.map((feat, idx) => (
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
      </div>
    </div>
  );
}

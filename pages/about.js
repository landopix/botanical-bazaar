import SEO from "../components/SEO";
import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../components/Button';
import { sanityClient } from '../lib/sanity';
import { isOptimizedCdnUrl, optimizeCdnUrl } from '../lib/image-utils';

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
  const isLocalOrAllowedCdn = (url) => {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('/')) return true;
    return isOptimizedCdnUrl(url);
  };

  return (
    <div style={{ background: '#00301E', minHeight: '100vh', padding: '3rem 1.5rem', color: '#E9DCBE' }}>
      <SEO title="About Our Nursery" description="Learn about The Botanical Bazaar LLC in St. Petersburg, FL—our tropical plant propagation philosophy, rare collector orchids, and local nursery history." />

      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {aboutData ? (
          <>
            {/* Header Hero */}
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
              {aboutData.logoImageUrl && (
                <div style={{ position: 'relative', width: '200px', height: '80px', margin: '0 auto 1rem auto' }}>
                  <Image
                    src={aboutData.logoImageUrl}
                    alt="The Botanical Bazaar Emblem"
                    fill
                    sizes="200px"
                    style={{ objectFit: 'contain' }}
                    unoptimized={!isLocalOrAllowedCdn(aboutData.logoImageUrl)}
                    onError={(e) => { if (e.target) e.target.style.display = 'none'; }}
                  />
                </div>
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
                <Image
                  src={aboutData.bannerImageUrl}
                  alt="The Botanical Bazaar Nursery Banner"
                  fill
                  sizes="(max-width: 1000px) 100vw, 1000px"
                  style={{ objectFit: 'cover' }}
                  unoptimized={!isLocalOrAllowedCdn(aboutData.bannerImageUrl)}
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

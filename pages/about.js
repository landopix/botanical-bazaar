import Head from 'next/head';
import React from 'react';
import { sanityClient, urlFor, isSanityConfigured } from '../lib/sanity';
import Button from '../components/Button';

const defaultAboutData = {
  title: 'About The Botanical Bazaar',
  bioParagraphs: [
    'The Botanical Bazaar is a tropical plant nursery rooted in the heart of St. Petersburg, Florida. Our passion is growing and curating rare and resilient plants that thrive in our subtropical climate. What began as a small backyard collection has blossomed into a community-focused nursery serving the entire Tampa Bay area.',
    'Local & Sustainable. We believe in nurturing both plants and people. Each cutting, seedling and tree is propagated, potted and cared for by our team using organic practices and earth-friendly materials. Our plants are acclimated to local conditions so they transition seamlessly into your home or garden.',
    'Community & Education. Beyond selling plants, we strive to cultivate connection. We host seasonal events, garden workshops and plant care consultations designed to empower new and experienced growers. We partner with local schools and community gardens to share knowledge and foster a love of plants.',
    'Our Story. Founded by lifelong plant enthusiasts in 2020, The Botanical Bazaar grew out of a desire to share the joy of gardening with our neighbors. Today we maintain a small, appointment-only nursery where you can see our collections and pick up orders. We also offer online shopping with local pickup options.'
  ],
  heroImages: [
    { url: '/assets/lantern.png', alt: 'The Botanical Bazaar Emblem' },
    { url: '/assets/brand-banner.png', alt: 'Nursery Garden View' }
  ],
  teamInfo: [
    { name: 'Founding Botanist', role: 'Nursery Lead & Curator', bio: 'Dedicated to rare tropical acclimatization and sustainable propagation.' }
  ]
};

export default function About({ aboutData }) {
  const data = aboutData || defaultAboutData;

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '900px', margin: '0 auto', color: '#E9DCBE' }}>
      <Head>
        <title>About | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Learn about The Botanical Bazaar, a St. Petersburg nursery cultivating rare and resilient tropical plants. Meet our team and discover our commitment to community." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/about" />
        <meta property="og:title" content="About The Botanical Bazaar" />
        <meta property="og:description" content="Learn about The Botanical Bazaar, a St. Petersburg nursery cultivating rare and resilient tropical plants." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/lantern.png" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '1.5rem' }}>
        {data.title}
      </h1>

      {data.heroImages && data.heroImages.length > 0 && (
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
          {data.heroImages.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={img.alt || 'Botanical Bazaar'}
              style={{ maxHeight: '280px', borderRadius: '12px', border: '1px solid #D4B06A', objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
            />
          ))}
        </div>
      )}

      <div style={{ background: '#1C3D2E', padding: '2rem', borderRadius: '12px', border: '1px solid #D4B06A', marginBottom: '3rem', lineHeight: '1.8' }}>
        {data.bioParagraphs.map((paragraph, idx) => (
          <p key={idx} style={{ marginBottom: '1.2rem', fontSize: '1.1rem' }}>
            {paragraph}
          </p>
        ))}
      </div>

      {data.teamInfo && data.teamInfo.length > 0 && (
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', textAlign: 'center', marginBottom: '1.5rem' }}>
            Meet Our Team
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            {data.teamInfo.map((member, idx) => (
              <div key={idx} style={{ background: '#00301E', padding: '1.5rem', borderRadius: '8px', border: '1px solid #D4B06A', textAlign: 'center' }}>
                {member.imageUrl && (
                  <img src={member.imageUrl} alt={member.name} style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem', border: '2px solid #D4B06A' }} />
                )}
                <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', margin: '0 0 0.3rem 0' }}>{member.name}</h3>
                <p style={{ color: '#F5E7C4', fontWeight: 'bold', fontSize: '0.95rem', margin: '0 0 0.8rem 0' }}>{member.role}</p>
                <p style={{ fontSize: '0.9rem', margin: 0 }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <Button variant="gold-filled" href="/shop">Explore Our Plant Catalog</Button>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  let aboutData = null;

  try {
    if (isSanityConfigured()) {
      const query = `*[_type == "aboutPage"][0]{
        title,
        bioText,
        heroImages[]{
          "url": asset->url,
          alt
        },
        teamInfo[]{
          name,
          role,
          bio,
          "imageUrl": image.asset->url
        }
      }`;
      const res = await sanityClient.fetch(query);
      if (res) {
        let bioParagraphs = defaultAboutData.bioParagraphs;
        if (Array.isArray(res.bioText) && res.bioText.length > 0) {
          bioParagraphs = res.bioText
            .filter(block => block._type === 'block' && block.children)
            .map(block => block.children.map(c => c.text).join(''));
        }
        aboutData = {
          title: res.title || defaultAboutData.title,
          bioParagraphs: bioParagraphs.length ? bioParagraphs : defaultAboutData.bioParagraphs,
          heroImages: res.heroImages && res.heroImages.length > 0 ? res.heroImages : defaultAboutData.heroImages,
          teamInfo: res.teamInfo && res.teamInfo.length > 0 ? res.teamInfo : defaultAboutData.teamInfo,
        };
      }
    }
  } catch (err) {
    console.warn('Sanity aboutPage fetch error, using default fallback:', err.message);
  }

  return {
    props: {
      aboutData,
    },
    revalidate: 60,
  };
}

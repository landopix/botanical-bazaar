import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';

export default function Gallery() {
  const images = [
    { title: 'Awarded Orchid Collection', desc: 'Fully blooming rare specimen orchids.', path: '/assets/lantern.png' },
    { title: 'Peanut Butter Fruit Tree', desc: 'Delicious Bunchosia Glandulifera sapling ready for pickup.', path: '/assets/peanut-butter-fruit.jpg' },
    { title: 'Everglades Tomato', desc: 'Resilient and heavy-yielding local Florida vine.', path: '/assets/everglades-tomato.jpg' }
  ];

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <Head>
        <title>Collector Orchid & Specimen Gallery | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Explore our visual gallery of rare tropical specimens, collector orchids, and mature aroids cultivated at The Botanical Bazaar in St. Petersburg, FL." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/gallery" />
        <meta property="og:title" content="Collector Orchid & Specimen Gallery | The Botanical Bazaar St. Petersburg FL" />
        <meta property="og:description" content="Explore our visual gallery of rare tropical specimens, collector orchids, and mature aroids." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content="https://thebotanicalbazaar.com/gallery" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', marginBottom: '1rem' }}>Collector's Gallery</h1>
      <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '3rem', fontStyle: 'italic', color: '#E9DCBE' }}>
        Highlighting some of our absolute finest rare and resilient tropical varieties grown in St. Petersburg, FL.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {images.map((img, i) => (
          <div key={i} style={{ background: '#1C3D2E', borderRadius: '12px', border: '1px solid #D4B06A', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img src={img.path} alt={img.title} style={{ width: '100%', height: '240px', objectFit: 'cover' }} onError={(e) => { e.target.src = '/assets/placeholder.png'; }} />
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ color: '#D4B06A', margin: '0 0 0.5rem 0', fontFamily: 'Cinzel, serif' }}>{img.title}</h3>
                <p style={{ margin: '0 0 1.5rem 0', lineHeight: '1.5' }}>{img.desc}</p>
              </div>
              <Button variant="outline" href="/shop">Explore Catalog</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

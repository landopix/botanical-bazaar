import Head from 'next/head';
import React, { useState } from 'react';
import { sanityClient, isSanityConfigured } from '../lib/sanity';
import Button from '../components/Button';

const defaultGalleryItems = [
  {
    title: 'Awarded Orchid Collection',
    category: 'Orchids',
    caption: 'Fully blooming rare specimen orchids in our St. Petersburg greenhouse.',
    imageUrl: '/assets/lantern.png'
  },
  {
    title: 'Peanut Butter Fruit Sapling',
    category: 'Rare Tropicals',
    caption: 'Delicious Bunchosia Glandulifera sapling thriving in Florida sun.',
    imageUrl: '/assets/peanut-butter-fruit.jpg'
  },
  {
    title: 'Everglades Tomato Vine',
    category: 'Nursery & Gardens',
    caption: 'Resilient and heavy-yielding local Florida native vine.',
    imageUrl: '/assets/everglades-tomato.jpg'
  },
  {
    title: 'Specimen Monstera Deliciosa',
    category: 'Aroids',
    caption: 'Mature fenestrated aroid specimen cultivated in shade house.',
    imageUrl: '/assets/brand-banner.png'
  }
];

export default function Gallery({ galleryItems }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const items = (galleryItems && galleryItems.length > 0) ? galleryItems : defaultGalleryItems;

  const categories = ['All', 'Rare Tropicals', 'Orchids', 'Aroids', 'Nursery & Gardens'];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category === activeCategory);

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1050px', margin: '0 auto', color: '#E9DCBE' }}>
      <Head>
        <title>Collector Orchid & Specimen Gallery | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Explore our visual gallery of rare tropical specimens, collector orchids, and mature aroids cultivated at The Botanical Bazaar in St. Petersburg, FL." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/gallery" />
        <meta property="og:title" content="Collector Orchid & Specimen Gallery | The Botanical Bazaar" />
        <meta property="og:description" content="Explore our visual gallery of rare tropical specimens, collector orchids, and mature aroids." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem' }}>
        Collector's Gallery
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', marginBottom: '2rem', fontStyle: 'italic', color: '#E9DCBE' }}>
        Highlighting some of our absolute finest rare and resilient tropical varieties grown in St. Petersburg, FL.
      </p>

      {/* Interactive Category Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.5rem 1.2rem',
              borderRadius: '20px',
              border: '1px solid #D4B06A',
              background: activeCategory === cat ? '#D4B06A' : 'transparent',
              color: activeCategory === cat ? '#00301E' : '#F5E7C4',
              fontFamily: 'Cinzel, serif',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {filteredItems.map((img, i) => (
          <div key={i} style={{ background: '#1C3D2E', borderRadius: '12px', border: '1px solid #D4B06A', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <img
              src={img.imageUrl || '/assets/placeholder.png'}
              alt={img.title}
              style={{ width: '100%', height: '240px', objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
            />
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', background: '#00301E', color: '#D4B06A', padding: '0.2rem 0.6rem', borderRadius: '4px', border: '1px solid #2d5a44', display: 'inline-block', marginBottom: '0.6rem' }}>
                  {img.category || 'Specimen'}
                </span>
                <h3 style={{ color: '#D4B06A', margin: '0 0 0.5rem 0', fontFamily: 'Cinzel, serif', fontSize: '1.25rem' }}>{img.title}</h3>
                <p style={{ margin: '0 0 1.5rem 0', lineHeight: '1.5', fontSize: '0.95rem' }}>{img.caption}</p>
              </div>
              <Button variant="outline" href="/shop">Explore Catalog</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  let galleryItems = null;

  try {
    if (isSanityConfigured()) {
      const query = `*[_type == "galleryImage"]{
        title,
        category,
        caption,
        "imageUrl": image.asset->url
      }`;
      const res = await sanityClient.fetch(query);
      if (Array.isArray(res) && res.length > 0) {
        galleryItems = res;
      }
    }
  } catch (err) {
    console.warn('Sanity galleryImage fetch error, using fallback:', err.message);
  }

  return {
    props: {
      galleryItems,
    },
    revalidate: 60,
  };
}

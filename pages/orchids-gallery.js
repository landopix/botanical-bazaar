import Head from 'next/head';
import React, { useState } from 'react';
import { sanityClient, isSanityConfigured } from '../lib/sanity';
import Button from '../components/Button';

const defaultGalleryItems = [
  {
    title: "Vanda Colmarie 'Spots'",
    category: 'Awarded Orchids',
    caption: 'Awarded clone with unique spotted petals and vigorous growth habit. Thermal shock threshold: 50°F.',
    imageUrl: '/assets/lantern.png'
  },
  {
    title: "Vanda Johanna Ljunggren 'Mimi Palmer × Coerulea'",
    category: 'Awarded Orchids',
    caption: 'Exotic hybrid with intoxicating fragrance and strong flowering performance in Florida climate.',
    imageUrl: '/assets/brand-banner.png'
  },
  {
    title: "Rhynchostylis Gigantea var. Illustre 'Foxtail Orchid'",
    category: 'Awarded Orchids',
    caption: 'Highly fragrant foxtail spikes; award-winning clone prized for bloom density.',
    imageUrl: '/assets/lantern.png'
  },
  {
    title: "Maxillariella Tenuifolia 'Coconut Orchid'",
    category: 'Awarded Orchids',
    caption: 'Sweet coconut fragrance with easy-care compact growth habit.',
    imageUrl: '/assets/brand-banner.png'
  },
  {
    title: "Darwinara Charm 'Blue Star' HCC, AD/AOS",
    category: 'Awarded Orchids',
    caption: 'Awarded HCC and AD/AOS; unusual blue-lilac colour with prolific blooming.',
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
    category: 'Nursery & Landscape',
    caption: 'Resilient and heavy-yielding local Florida native vine.',
    imageUrl: '/assets/everglades-tomato.jpg'
  },
  {
    title: 'Specimen Monstera Deliciosa',
    category: 'Aroids & Exotics',
    caption: 'Mature fenestrated aroid specimen cultivated in shade house.',
    imageUrl: '/assets/brand-banner.png'
  }
];

export default function OrchidsGallery({ galleryItems }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const items = galleryItems && galleryItems.length > 0 ? galleryItems : defaultGalleryItems;

  const categories = ['All', 'Awarded Orchids', 'Aroids & Exotics', 'Rare Tropicals', 'Nursery & Landscape'];

  const filteredItems = activeCategory === 'All'
    ? items
    : items.filter(item => item.category === activeCategory);

  return (
    <div style={{ padding: '3.5rem 1.5rem', maxWidth: '1150px', margin: '0 auto', color: '#E9DCBE', boxSizing: 'border-box' }}>
      <Head>
        <title>Awarded Orchids & Collector Specimen Gallery | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="Explore our visual collector gallery of awarded orchid clones, mature fenestrated aroids, and rare tropical specimens cultivated in St. Petersburg, FL." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/orchids-gallery" />
        <meta property="og:title" content="Awarded Orchids & Collector Specimen Gallery | The Botanical Bazaar" />
        <meta property="og:description" content="Explore our visual collector gallery of awarded orchid clones, mature fenestrated aroids, and rare tropical specimens." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '2.6rem', letterSpacing: '0.08em', margin: '0 0 0.8rem 0', textTransform: 'uppercase' }}>
          Collector&apos;s Gallery
        </h1>
        <p style={{ fontSize: '1.15rem', fontStyle: 'italic', color: '#E9DCBE', maxWidth: '750px', margin: '0 auto 0.5rem auto', lineHeight: '1.6' }}>
          Discover our hand-curated selection of awarded orchid clones, mature aroids, and exotic tropical specimens cultivated at our St. Petersburg greenhouse.
        </p>
        <p style={{ fontSize: '0.9rem', color: '#8DA38B', margin: 0 }}>
          Tap any image to open high-resolution lightbox view.
        </p>
      </div>

      {/* Interactive Category Filter Pills */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '3rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.55rem 1.3rem',
              borderRadius: '24px',
              border: '1px solid #D4B06A',
              background: activeCategory === cat ? '#D4B06A' : 'rgba(0, 48, 30, 0.6)',
              color: activeCategory === cat ? '#00301E' : '#F5E7C4',
              fontFamily: 'Cinzel, serif',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: activeCategory === cat ? '0 4px 12px rgba(212, 176, 106, 0.3)' : 'none'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Visual Image Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
        {filteredItems.map((img, i) => {
          const imgSrc = img.imageUrl || '/assets/placeholder.png';
          return (
            <div
              key={i}
              style={{
                background: '#1C3D2E',
                borderRadius: '12px',
                border: '1px solid #D4B06A',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => setSelectedImage(img)}
            >
              <div style={{ position: 'relative', width: '100%', height: '240px', overflow: 'hidden', background: '#00301E' }}>
                <img
                  src={imgSrc}
                  alt={img.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                  onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                />
                <span
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    background: '#00301E',
                    color: '#D4B06A',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '4px',
                    border: '1px solid #D4B06A',
                    fontFamily: 'Cinzel, serif',
                    fontWeight: 'bold'
                  }}
                >
                  {img.category || 'Specimen'}
                </span>
              </div>

              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ color: '#D4B06A', margin: '0 0 0.5rem 0', fontFamily: 'Cinzel, serif', fontSize: '1.25rem' }}>
                    {img.title}
                  </h3>
                  <p style={{ margin: '0 0 1.5rem 0', lineHeight: '1.5', fontSize: '0.95rem', color: '#E9DCBE' }}>
                    {img.caption}
                  </p>
                </div>
                <Button
                  variant="outline"
                  href="/shop"
                  onClick={(e) => e.stopPropagation()}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Explore Catalog
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal Overlay */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1200,
            padding: '1.5rem',
            boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#00301E',
              border: '2px solid #D4B06A',
              borderRadius: '16px',
              maxWidth: '750px',
              width: '100%',
              padding: '2rem',
              position: 'relative',
              boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
              textAlign: 'center'
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              aria-label="Close Lightbox"
              style={{
                position: 'absolute',
                top: '15px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: '#D4B06A',
                fontSize: '1.8rem',
                cursor: 'pointer',
                lineHeight: 1
              }}
            >
              ✕
            </button>

            <img
              src={selectedImage.imageUrl || '/assets/placeholder.png'}
              alt={selectedImage.title}
              style={{
                maxWidth: '100%',
                maxHeight: '450px',
                borderRadius: '8px',
                objectFit: 'contain',
                marginBottom: '1.5rem',
                border: '1px solid rgba(212, 176, 106, 0.3)'
              }}
              onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
            />

            <span
              style={{
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#D4B06A',
                fontFamily: 'Cinzel, serif',
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              {selectedImage.category || 'Specimen'}
            </span>
            <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.6rem', margin: '0 0 0.8rem 0' }}>
              {selectedImage.title}
            </h2>
            <p style={{ color: '#E9DCBE', fontSize: '1.05rem', lineHeight: '1.6', margin: '0 0 1.5rem 0' }}>
              {selectedImage.caption}
            </p>

            <Button variant="gold-filled" href="/shop">
              Find Plants in Shop &rarr;
            </Button>
          </div>
        </div>
      )}
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

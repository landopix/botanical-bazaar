import Head from 'next/head';
import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import GalleryItemCard from '../components/GalleryItemCard';
import { sanityClient } from '../lib/sanity';

const CATEGORY_MAP = {
  'collector-orchids': 'Collector Orchids',
  'tropical-fruit-trees': 'Tropical Fruit Trees',
  'herbs-medicinal': 'Herbs & Medicinal',
  'rare-aroids': 'Rare Aroids',
  'apothecary-goods': 'Apothecary Goods',
};

const DEFAULT_GALLERY_IMAGES = [
  {
    _id: '1',
    title: 'Awarded Cattleya Orchid Specimen',
    category: 'collector-orchids',
    categoryLabel: 'Collector Orchids',
    description: 'A vibrant specimen Cattleya orchid in full spring bloom with cascading purple petals and sweet scent.',
    imageUrl: '/assets/lantern.png',
    alt: 'Awarded Cattleya Orchid'
  },
  {
    _id: '2',
    title: 'Peanut Butter Fruit Tree (Bunchosia Glandulifera)',
    category: 'tropical-fruit-trees',
    categoryLabel: 'Tropical Fruit Trees',
    description: 'Resilient tropical fruit tree producing sweet peanut-butter flavored red berries in Zone 9b/10a.',
    imageUrl: '/assets/peanut-butter-fruit.jpg',
    alt: 'Peanut Butter Fruit Tree'
  },
  {
    _id: '3',
    title: 'Everglades Tomato Vine',
    category: 'herbs-medicinal',
    categoryLabel: 'Herbs & Medicinal',
    description: 'Indeterminate wild Florida Everglades heirloom producing heavy clusters of sweet currant tomatoes.',
    imageUrl: '/assets/everglades-tomato.jpg',
    alt: 'Everglades Tomato Vine'
  },
  {
    _id: '4',
    title: 'Rare Variegated Monstera Deliciosa',
    category: 'rare-aroids',
    categoryLabel: 'Rare Aroids',
    description: 'High-contrast cream and mint chimera fenestrated leaf Aroid nurtured at our St. Petersburg nursery.',
    imageUrl: '/assets/brand-banner.png',
    alt: 'Variegated Monstera'
  },
  {
    _id: '5',
    title: 'Vanda Orchid Hanging Display',
    category: 'collector-orchids',
    categoryLabel: 'Collector Orchids',
    description: 'Aerial root system with striking cobalt blue flowers cultivated under natural Florida shade cloth.',
    imageUrl: '/assets/lantern.png',
    alt: 'Vanda Orchid'
  },
  {
    _id: '6',
    title: 'Organic Apothecary Tinctures',
    category: 'apothecary-goods',
    categoryLabel: 'Apothecary Goods',
    description: 'Handcrafted herbal extracts made from nursery-harvested medicinal botanicals.',
    imageUrl: '/assets/lantern-submark.png',
    alt: 'Organic Tinctures'
  }
];

export async function getStaticProps() {
  let images = DEFAULT_GALLERY_IMAGES;
  try {
    if (sanityClient) {
      const query = `*[_type == "galleryImage"]{
        _id,
        title,
        category,
        description,
        "imageUrl": image.asset->url
      }`;
      const cmsImages = await sanityClient.fetch(query);
      if (cmsImages && cmsImages.length > 0) {
        images = cmsImages.map(img => ({
          ...img,
          categoryLabel: CATEGORY_MAP[img?.category] || img?.category || 'Botanical Highlight',
          alt: img?.title
        }));
      }
    }
  } catch (err) {
    console.warn("Sanity fetch failed for galleryImage, falling back to local dataset:", err.message);
  }

  return {
    props: {
      initialImages: images
    },
    revalidate: 60
  };
}

export default function OrchidsGallery({ initialImages }) {
  const images = initialImages && initialImages.length > 0 ? initialImages : DEFAULT_GALLERY_IMAGES;
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const categoryValues = ['All', ...Array.from(new Set(images.map(img => img?.category).filter(Boolean)))];

  const filteredImages = activeCategory === 'All'
    ? images
    : images.filter(img => img?.category === activeCategory);

  return (
    <div style={{ background: '#00301E', minHeight: '100vh', padding: '3rem 1.5rem', color: '#E9DCBE' }}>
      <Head>
        <title>Collector Orchid &amp; Tropical Specimen Gallery | The Botanical Bazaar St. Petersburg FL</title>
        <meta name="description" content="High-resolution visual gallery of rare tropical specimens, collector orchids, variegated aroids, and fruit trees grown at The Botanical Bazaar." />
        <link rel="canonical" href="https://thebotanicalbazaar.com/orchids-gallery" />
        <meta property="og:title" content="Collector Orchid &amp; Tropical Specimen Gallery | The Botanical Bazaar" />
        <meta property="og:description" content="Visual showcase of rare orchids and tropical specimens cultivated in St. Petersburg, FL." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
            Botanical Collector Gallery
          </h1>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#F5E7C4', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            High-resolution photographic highlights of rare orchids, mature tropical specimens, and exotic varieties nurtured at our St. Petersburg nursery.
          </p>
          <div style={{ width: '80px', height: '2px', background: '#D4B06A', margin: '0 auto' }}></div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {categoryValues.map((catVal) => {
            const label = catVal === 'All' ? 'All' : (CATEGORY_MAP[catVal] || catVal);
            return (
              <button
                key={catVal}
                onClick={() => setActiveCategory(catVal)}
                style={{
                  backgroundColor: activeCategory === catVal ? '#D4B06A' : '#1C3D2E',
                  color: activeCategory === catVal ? '#00301E' : '#D4B06A',
                  border: '1px solid #D4B06A',
                  borderRadius: '24px',
                  padding: '0.5rem 1.2rem',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: activeCategory === catVal ? '0 4px 12px rgba(212, 176, 106, 0.3)' : 'none'
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Masonry / Responsive Visual Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.8rem',
          alignItems: 'stretch'
        }}>
          {filteredImages.map((img) => (
            <GalleryItemCard
              key={img?._id || img?.title}
              item={img}
              onClick={() => setSelectedImage(img)}
            />
          ))}
        </div>
      </div>

      {/* Click-to-Expand Lightbox Modal */}
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
            backdropFilter: 'blur(6px)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            boxSizing: 'border-box'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#00301E',
              border: '2px solid #D4B06A',
              borderRadius: '12px',
              maxWidth: '850px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)'
            }}
          >
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#1C3D2E',
                color: '#D4B06A',
                border: '1px solid #D4B06A',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '1.2rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
              aria-label="Close modal"
            >
              ✕
            </button>
            <div style={{ width: '100%', height: '400px', background: '#001F14', position: 'relative' }}>
              <img
                src={selectedImage?.imageUrl || selectedImage?.image || '/assets/placeholder.png'}
                alt={selectedImage?.alt || selectedImage?.title || 'Gallery Specimen'}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
              />
            </div>
            <div style={{ padding: '2rem' }}>
              {(selectedImage?.categoryLabel || CATEGORY_MAP[selectedImage?.category] || selectedImage?.category) && (
                <span style={{ color: '#8DA38B', textTransform: 'uppercase', fontFamily: 'Cinzel, serif', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
                  {selectedImage?.categoryLabel || CATEGORY_MAP[selectedImage?.category] || selectedImage?.category}
                </span>
              )}
              <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: '0.3rem', marginBottom: '1rem' }}>
                {selectedImage?.title || 'Botanical Specimen'}
              </h2>
              <p style={{ color: '#F5E7C4', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
                {selectedImage?.description || ''}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button variant="gold-filled" href="/shop">Browse Nursery Catalog</Button>
                <button
                  onClick={() => setSelectedImage(null)}
                  style={{
                    background: 'transparent',
                    color: '#D4B06A',
                    border: '1px solid #D4B06A',
                    borderRadius: '24px',
                    padding: '0.66rem 1.6rem',
                    fontFamily: 'Cinzel, serif',
                    cursor: 'pointer'
                  }}
                >
                  Close Gallery
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .gallery-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }
        .gallery-card:hover .gallery-img {
          transform: scale(1.04);
        }
      `}</style>
    </div>
  );
}

import Head from 'next/head';
import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import GalleryItemCard from '../components/GalleryItemCard';
import GalleryItemSkeleton from '../components/skeletons/GalleryItemSkeleton';
import { sanityClient } from '../lib/sanity';

const CATEGORY_MAP = {
  orchid: 'Orchid',
  aroid: 'Aroid',
  tropicalFoliage: 'Tropical Foliage',
  other: 'Other',
  'collector-orchids': 'Collector Orchids',
  'tropical-fruit-trees': 'Tropical Fruit Trees',
  'herbs-medicinal': 'Herbs & Medicinal',
  'rare-aroids': 'Rare Aroids',
  'apothecary-goods': 'Apothecary Goods',
};

export async function getStaticProps() {
  let images = [];
  let page = null;
  try {
    if (sanityClient) {
      const query = `*[_type == "collectorGallery" && slug.current == "orchids-gallery"][0]{
        title,
        intro,
        seo,
        items[]{
          _key,
          scientificName,
          commonName,
          plantGroup,
          caption,
          action,
          "imageUrl": image.asset->url,
          "alt": image.alt
        }
      }`;
      page = await sanityClient.fetch(query);
      if (Array.isArray(page?.items) && page.items.length > 0) {
        images = page.items.map(item => ({
          _id: item?._key,
          title: item?.scientificName || item?.commonName || 'Botanical Specimen',
          commonName: item?.commonName || '',
          scientificName: item?.scientificName || '',
          category: item?.plantGroup || 'other',
          categoryLabel: CATEGORY_MAP[item?.plantGroup] || item?.plantGroup || 'Botanical Highlight',
          description: item?.caption || '',
          imageUrl: item?.imageUrl || '',
          alt: item?.alt || item?.scientificName || item?.commonName || 'Botanical specimen',
          action: item?.action || null
        }));
      }
    }
  } catch (err) {
    console.warn("Sanity fetch failed for collectorGallery:", err.message);
  }

  return {
    props: {
      initialImages: images,
      pageContent: page ? {
        title: page.title || '',
        intro: page.intro || '',
        seo: page.seo || null
      } : null
    },
    revalidate: 60
  };
}

export default function OrchidsGallery({ initialImages = [], pageContent = null }) {
  const images = initialImages;
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const categoryValues = images.length > 0
    ? ['All', ...Array.from(new Set(images.map(img => img?.category).filter(Boolean)))]
    : [];

  const filteredImages = activeCategory === 'All'
    ? images
    : images.filter(img => img?.category === activeCategory);

  return (
    <div style={{ background: '#00301E', minHeight: '100vh', padding: '3rem 1.5rem', color: '#E9DCBE' }}>
      <Head>
        <title>{pageContent?.seo?.title || 'Collector Orchid & Tropical Specimen Gallery | The Botanical Bazaar St. Petersburg FL'}</title>
        <meta name="description" content={pageContent?.seo?.description || 'High-resolution visual gallery of rare tropical specimens, collector orchids, variegated aroids, and fruit trees grown at The Botanical Bazaar.'} />
        <link rel="canonical" href="https://thebotanicalbazaar.com/orchids-gallery" />
        <meta property="og:title" content="Collector Orchid &amp; Tropical Specimen Gallery | The Botanical Bazaar" />
        <meta property="og:description" content="Visual showcase of rare orchids and tropical specimens cultivated in St. Petersburg, FL." />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
      </Head>

      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
            {pageContent?.title || 'Botanical Collector Gallery'}
          </h1>
          <p style={{ fontSize: '1.2rem', fontStyle: 'italic', color: '#F5E7C4', maxWidth: '700px', margin: '0 auto 1.5rem' }}>
            {pageContent?.intro || 'High-resolution photographic highlights of rare orchids, mature tropical specimens, and exotic varieties nurtured at our St. Petersburg nursery.'}
          </p>
          <div style={{ width: '80px', height: '2px', background: '#D4B06A', margin: '0 auto' }}></div>
        </div>

        {/* Category Filter Pills (rendered only when items exist) */}
        {categoryValues.length > 1 && (
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
        )}

        {/* Dynamic Gallery Content vs Branded Empty State */}
        {filteredImages.length > 0 ? (
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
        ) : (
          <div style={{
            background: '#00301E',
            border: '1px solid #D4B06A',
            borderRadius: '12px',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            margin: '2rem auto',
            maxWidth: '650px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}>

            <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', fontSize: '1.8rem', marginTop: 0, marginBottom: '0.8rem', letterSpacing: '0.05em' }}>
              New Botanical Updates Coming Soon!
            </h3>
            <p style={{ color: '#E9DCBE', fontSize: '1.1rem', margin: '0 0 1.8rem 0', lineHeight: '1.6' }}>
              Our specimen gallery is currently updating with fresh tropical and orchid photography from our St. Petersburg greenhouse.
            </p>
            <Button variant="gold-filled" href="/shop">Browse Nursery Catalog</Button>
          </div>
        )}
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
              {selectedImage?.commonName && (
                <p style={{ color: '#8DA38B', fontStyle: 'italic', marginTop: '-0.6rem', marginBottom: '1rem' }}>
                  {selectedImage.commonName}
                </p>
              )}
              <p style={{ color: '#F5E7C4', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '1.8rem' }}>
                {selectedImage?.description || ''}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Button variant="gold-filled" href={selectedImage?.action?.href || '/shop'}>
                  {selectedImage?.action?.label || 'Browse Nursery Catalog'}
                </Button>
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
    </div>
  );
}

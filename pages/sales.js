import SEO from "../components/SEO";
import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { getAllProducts } from '../lib/shopify';

export async function getStaticProps() {
  try {
    const allProducts = await getAllProducts();
    const saleProducts = (allProducts || []).filter((p) => {
      const hasDiscount = p?.compareAtPrice && p?.price && p.compareAtPrice > p.price;
      const isTaggedSale = Array.isArray(p?.tags) && p.tags.some((t) => t?.toLowerCase() === 'sale');
      return hasDiscount || isTaggedSale;
    });

    return {
      props: {
        saleProducts: saleProducts || [],
        recommendations: (allProducts || []).slice(0, 3)
      },
      revalidate: 60
    };
  } catch (err) {
    console.error('Error in sales page getStaticProps:', err);
    return {
      props: {
        saleProducts: [],
        recommendations: []
      },
      revalidate: 60
    };
  }
}

export default function Sales({ saleProducts = [], recommendations = [] }) {
  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1150px', margin: '0 auto', color: '#E9DCBE' }}>
      <SEO title="Special Nursery Sales" description="Explore current sales, seasonal discounts, and featured promotional plant offers at The Botanical Bazaar in St. Petersburg, FL." />

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.8rem' }}>
        Special Nursery Sales
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 2.5rem auto', lineHeight: '1.6', fontStyle: 'italic' }}>
        Seasonal discounts and limited-time botanical promotions sourced directly from our nursery benches in St. Petersburg, Florida.
      </p>

      {saleProducts.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'stretch',
            marginBottom: '3rem'
          }}
        >
          {saleProducts.map((p) => (
            <ProductCard key={p?.slug || p?.id} product={p} />
          ))}
        </div>
      ) : (
        <div style={{ background: '#00301E', border: '1px solid #D4B06A', padding: '2.5rem', borderRadius: '12px', textAlign: 'center', marginBottom: '3.5rem' }}>
          <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0 }}>
            Propagation Batch In Progress
          </h2>
          <p style={{ maxWidth: '650px', margin: '0.8rem auto 1.8rem auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
            There are currently no featured sale items in this drop. Check back soon for seasonal promotional discounts, or explore our full nursery inventory below!
          </p>

          {recommendations.length > 0 && (
            <div>
              <h3 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginBottom: '1.5rem' }}>
                Featured Nursery Recommendations
              </h3>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  alignItems: 'stretch'
                }}
              >
                {recommendations.map((p) => (
                  <ProductCard key={p?.slug || p?.id} product={p} />
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <Button variant="gold-filled" href="/shop">Explore Full Catalog</Button>
          </div>
        </div>
      )}
    </div>
  );
}

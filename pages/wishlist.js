import Head from 'next/head';
import React from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import ProductCard from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export default function Wishlist() {
  const { wishlist, clearWishlist } = useWishlist();

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto', color: '#E9DCBE', minHeight: '60vh' }}>
      <Head>
        <title>Your Botanical Wishlist | The Botanical Bazaar</title>
        <meta name="description" content="View and manage your saved tropical plants, collector orchids, and wishlist items at The Botanical Bazaar." />
      </Head>

      <h1 style={{ color: '#D4B06A', textAlign: 'center', fontFamily: 'Cinzel, serif', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
        Your Wishlist
      </h1>
      <p style={{ textAlign: 'center', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto', lineHeight: '1.5', fontStyle: 'italic' }}>
        Keep track of rare tropical specimens, collector orchids, and fruit trees for your garden collection.
      </p>

      {wishlist && wishlist.length > 0 ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #D4B06A', paddingBottom: '0.8rem' }}>
            <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#D4B06A' }}>
              {wishlist.length} {wishlist.length === 1 ? 'Saved Specimen' : 'Saved Specimens'}
            </span>
            <button
              onClick={clearWishlist}
              style={{
                background: 'transparent',
                color: '#ba2f2f',
                border: '1px solid #ba2f2f',
                padding: '0.4rem 1rem',
                borderRadius: '20px',
                fontFamily: 'Crimson Text, serif',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Clear All Wishlist Items
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.5rem',
              alignItems: 'stretch',
              marginBottom: '3rem'
            }}
          >
            {wishlist.map((item) => (
              <ProductCard key={item?.slug || item?.id} product={item} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ background: '#00301E', border: '1px solid #D4B06A', padding: '3rem 2rem', borderRadius: '12px', textAlign: 'center', maxWidth: '600px', margin: '2rem auto' }}>
          <h2 style={{ color: '#D4B06A', fontFamily: 'Cinzel, serif', marginTop: 0 }}>Your Wishlist is Empty</h2>
          <p style={{ margin: '1rem 0 2rem 0', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Explore our nursery catalog and click the heart icon on any plant card to save items to your wishlist.
          </p>
          <Button variant="gold-filled" href="/shop">Browse Nursery Catalog</Button>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { isSanityConfigured, sanityClient } from '../lib/sanity';

export default function Shop() {
  const router = useRouter();
  const { category, search } = router.query;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [searchQuery, setSearchQuery] = useState(search || '');
  const { toggleWishlist, wishlist } = useWishlist();

  useEffect(() => {
    const fetchProducts = async () => {
      if (isSanityConfigured()) {
        try {
          const sanityData = await sanityClient.fetch(`*[_type == "product"]{
            "slug": slug.current,
            name,
            sku,
            "image": image.asset->url,
            type,
            description,
            price,
            quantity,
            zones,
            categories,
            sizes,
            tags
          }`);
          if (sanityData && sanityData.length > 0) {
            setProducts(sanityData);
            setFilteredProducts(sanityData);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch from Sanity.io. Falling back to local catalog.', err);
        }
      }

      // Local offline fallback
      if (typeof window !== 'undefined') {
        const loadProducts = () => {
          const raw = window.PRODUCTS || [];
          setProducts(raw);
          setFilteredProducts(raw);
        };
        if (window.PRODUCTS) {
          loadProducts();
        } else {
          const script = document.createElement('script');
          script.src = '/products.js';
          script.onload = loadProducts;
          document.body.appendChild(script);
        }
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    if (category) setSelectedCategory(category);
  }, [category]);

  useEffect(() => {
    if (search) setSearchQuery(search);
  }, [search]);

  useEffect(() => {
    let result = products;

    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(p => p.categories && p.categories.includes(selectedCategory));
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  const categoriesList = [
    { id: 'all', name: 'Shop All' },
    { id: 'herbs-medicinal', name: 'Herbs & Medicinal' },
    { id: 'fruit-trees', name: 'Fruit Trees' },
    { id: 'houseplants', name: 'Houseplants' },
    { id: 'orchids-tropicals', name: 'Orchids & Tropicals' },
    { id: 'seeds', name: 'Seeds' },
    { id: 'exotics-rare', name: 'Exotics & Rare' }
  ];

  return (
    <div className="shop-page" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#D4B06A', textAlign: 'center', marginBottom: '2rem' }}>Our Plant Collection</h1>

      {/* Category selector */}
      <div className="categories-filter" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem', justifyContent: 'center', marginBottom: '2rem' }}>
        {categoriesList.map(cat => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? 'gold-filled' : 'outline'}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      {/* Search filter input */}
      <div style={{ maxWidth: '400px', margin: '0 auto 2rem auto' }}>
        <input
          type="search"
          placeholder="Filter catalog..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 1rem',
            borderRadius: '24px',
            border: '2px solid #D4B06A',
            backgroundColor: '#1C3D2E',
            color: '#F4F1E1',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Local Pickup Only Warning */}
      <div className="pickup-banner" style={{ background: '#D4B06A', color: '#1C3D2E', padding: '0.8rem 1.2rem', margin: '1rem auto 2rem auto', borderRadius: '10px', fontSize: '1rem', textAlign: 'center', maxWidth: '800px' }}>
        <strong>Local Pickup Only</strong>&nbsp;–&nbsp;Our plants are available for pick&nbsp;up in St.&nbsp;Petersburg, FL. We do not ship live plants at this time.
      </div>

      {/* Products Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '2rem' }}>
        {filteredProducts.map(product => {
          const isSoldOut = !product.quantity || product.quantity <= 0;
          const isWishlisted = wishlist.some(item => item.slug === product.slug);

          return (
            <div
              key={product.slug}
              className="product-card"
              style={{
                backgroundColor: '#F5E7C4',
                borderRadius: '12px',
                padding: '1.2rem',
                color: '#1C3D2E',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                opacity: isSoldOut ? 0.6 : 1,
                position: 'relative'
              }}
            >
              {/* Wishlist Heart Icon */}
              <button
                onClick={() => toggleWishlist(product)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  zIndex: 2,
                  padding: '4px'
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill={isWishlisted ? '#ba2f2f' : 'none'}
                  stroke={isWishlisted ? '#ba2f2f' : '#1C3D2E'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>

              <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
                  style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '1rem' }}
                />
                <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', minHeight: '3.2rem' }}>{product.name}</h3>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold' }}>
                  {isNaN(product.price) || !product.price ? 'Price on Request' : `$${product.price.toFixed(2)}`}
                </p>
                <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#555' }}>{product.sizes || 'Standard Pot'}</p>
              </Link>

              {isSoldOut ? (
                <div style={{
                  background: '#ba2f2f',
                  color: '#ffffff',
                  padding: '0.5rem',
                  borderRadius: '24px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Sold Out
                </div>
              ) : (
                <Button variant="green-filled" href={`/product/${product.slug}`} style={{ width: '100%' }}>
                  View Plant
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

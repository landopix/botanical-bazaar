import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { isSanityConfigured, sanityClient } from '../lib/sanity';

export default function Shop() {
  const router = useRouter();
  const { category, search, zone } = router.query;

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(category || '');
  const [searchQuery, setSearchQuery] = useState(search || '');
  const [selectedZone, setSelectedZone] = useState(zone || '');
  const [hideSoldOut, setHideSoldOut] = useState(false);
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
            tags,
            temp_threshold
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
    if (zone) setSelectedZone(zone);
  }, [zone]);

  useEffect(() => {
    let result = products;

    if (selectedCategory) {
      result = result.filter(p => p.categories && p.categories.includes(selectedCategory));
    }

    if (selectedZone) {
      result = result.filter(p => p.zones && p.zones.includes(selectedZone));
    }

    if (hideSoldOut) {
      result = result.filter(p => p.quantity && p.quantity >= 3);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        let haystack = [p.name, p.type, p.description, p.sku].filter(Boolean).join(' ').toLowerCase();
        if (Array.isArray(p.categories)) haystack += ' ' + p.categories.join(' ').toLowerCase();
        if (Array.isArray(p.zones)) haystack += ' ' + p.zones.join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, selectedZone, hideSoldOut, products]);

  // Extract unique categories and zones dynamic behavior from products
  const availableCategories = new Set();
  const availableZones = new Set();
  products.forEach(prod => {
    if (Array.isArray(prod.categories)) {
      prod.categories.forEach(cat => availableCategories.add(cat));
    }
    if (Array.isArray(prod.zones)) {
      prod.zones.forEach(zone => availableZones.add(zone));
    }
  });

  const categoryChips = Array.from(availableCategories).map(cat => ({
    id: cat,
    name: cat.replace(/-/g, ' ').replace(/\b(\w)/g, c => c.toUpperCase())
  }));

  const handleCategoryClick = (catId) => {
    const isCurrentlySelected = selectedCategory === catId;
    const nextCat = isCurrentlySelected ? '' : catId;
    setSelectedCategory(nextCat);

    const params = new URLSearchParams(window.location.search);
    if (nextCat) {
      params.set('category', nextCat);
    } else {
      params.delete('category');
    }
    const newQuery = params.toString();
    router.replace(newQuery ? `?${newQuery}` : window.location.pathname, undefined, { shallow: true });
  };

  const handleZoneChange = (zVal) => {
    setSelectedZone(zVal);
    const params = new URLSearchParams(window.location.search);
    if (zVal) {
      params.set('zone', zVal);
    } else {
      params.delete('zone');
    }
    const newQuery = params.toString();
    router.replace(newQuery ? `?${newQuery}` : window.location.pathname, undefined, { shallow: true });
  };

  return (
    <div className="shop-container">
      <h1 style={{ color: '#E9DCBE', fontSize: '2.2rem', textAlign: 'center', letterSpacing: '0.02em', marginTop: '0.3em', marginBottom: '1.5em', fontFamily: 'Georgia, serif' }}>
        Shop All Plants
      </h1>

      {/* Local Pickup Banner */}
      <div className="pickup-banner" style={{ background: '#D4B06A', color: '#1C3D2E', padding: '0.8rem 1.2rem', borderRadius: '10px', marginBottom: '1.2rem', textAlign: 'center', fontSize: '1rem' }}>
        <strong>Local Pickup Only</strong>&nbsp;–&nbsp;All purchases are available for pick&nbsp;up at our nursery in St.&nbsp;Petersburg, FL. We do not ship at this time.
      </div>

      <p className="shop-intro">
        Browse our curated selection of rare and resilient tropical plants grown in St.&nbsp;Petersburg. Use the filters to explore categories like Medicinal, Culinary, Fragrant, Flowering Trees, Seeds, Rare &amp; Unusual, Best Plants for Your Zone and more. All listings reflect live inventory—quantities are limited and updated daily.
      </p>

      {/* Filter controls: category and zone selectors */}
      <div id="filters" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div id="category-filter" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', justifyContent: 'center' }}>
          {categoryChips.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className={selectedCategory === cat.id ? 'selected' : ''}
              style={{
                background: selectedCategory === cat.id ? '#D4B06A' : '#1C3D2E',
                color: selectedCategory === cat.id ? '#1C3D2E' : '#F5E7C4',
                border: '1px solid #749c7f',
                borderRadius: '14px',
                padding: '0.3rem 0.8rem',
                fontFamily: 'Crimson Text, Georgia, serif',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.12s'
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div id="zone-filter" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <label htmlFor="zone-select" style={{ fontSize: '1rem', color: '#E9DCBE' }}>Zone:</label>
          <select
            id="zone-select"
            name="zone"
            value={selectedZone}
            onChange={(e) => handleZoneChange(e.target.value)}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: '6px',
              border: '1px solid #749c7f',
              fontFamily: 'Crimson Text, Georgia, serif',
              fontSize: '1rem',
              background: '#F5E7C4',
              color: '#1C3D2E',
              outline: 'none'
            }}
          >
            <option value="">All</option>
            {Array.from(availableZones)
              .filter(z => z !== '1' && z !== '2') // skip extremely cold zones as in legacy
              .sort((a, b) => parseFloat(a) - parseFloat(b))
              .map(z => (
                <option key={z} value={z}>{z}</option>
              ))
            }
          </select>
        </div>
      </div>

      {/* Search Filter Input */}
      <div id="search-bar" style={{ textAlign: 'center', margin: '-0.5rem auto 1.2rem auto', maxWidth: '320px', width: '100%' }}>
        <input
          type="text"
          placeholder="Search plants…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search plants"
          style={{
            width: '100%',
            padding: '0.5rem 0.8rem',
            borderRadius: '8px',
            border: '1px solid #749c7f',
            background: '#F5E7C4',
            color: '#1C3D2E',
            fontFamily: 'Crimson Text, Georgia, serif',
            fontSize: '1rem',
            boxSizing: 'border-box',
            outline: 'none'
          }}
        />
      </div>

      {/* Hide Sold Out Toggle */}
      <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', color: '#E9DCBE', fontSize: '1.05rem', fontFamily: 'Crimson Text, Georgia, serif' }}>
          <input
            type="checkbox"
            checked={hideSoldOut}
            onChange={(e) => setHideSoldOut(e.target.checked)}
            style={{
              width: '18px',
              height: '18px',
              accentColor: '#D4B06A',
              cursor: 'pointer'
            }}
          />
          Hide Sold Out Plants
        </label>
      </div>

      <p style={{ maxWidth: '600px', margin: '0 auto 2rem auto', fontSize: '1.1rem', lineHeight: '1.5', textAlign: 'center', color: '#E9DCBE' }}>
        Browse our curated selection of plants grown and sourced for our St.&nbsp;Petersburg and Tampa Bay community. We stock tropical houseplants, fruit trees and edibles, orchids, and hardy landscape plants. Inventory changes regularly, so check back often or drop us a note if you're looking for something special.
      </p>

      {/* Products Grid matches legacy flex wrap design with uniform heights */}
      <div className="products">
        {filteredProducts.map(product => {
          const isSoldOut = !product.quantity || product.quantity < 3;
          const isWishlisted = wishlist.some(item => item.slug === product.slug);

          return (
            <div
              key={product.slug}
              className={`product-card ${isSoldOut ? 'sold-out' : ''}`}
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
                  zIndex: 10,
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

              {/* Absolute sold-out-badge in upper right if sold out */}
              {isSoldOut && (
                <div className="sold-out-badge">
                  Sold Out
                </div>
              )}

              {/* Top content wrapper keeps image, title, properties together */}
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', flexGrow: 1, textAlign: 'center' }}>
                <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                  <div style={{ position: 'relative', width: '100%', height: '160px', marginBottom: '0.8rem' }}>
                    <Image
                      src={product.image || '/assets/placeholder.png'}
                      alt={product.name}
                      fill
                      sizes="220px"
                      style={{ objectFit: 'cover', borderRadius: '8px', background: '#e9dcbe11' }}
                      unoptimized={!product.image || !product.image.includes('cdn.sanity.io')}
                    />
                  </div>
                  <strong>
                    {product.name}
                  </strong>
                </Link>
                <p>{product.sizes || 'Standard Pot'}</p>
                <p>{product.type}</p>
                <div className={`price ${isSoldOut ? 'sold' : 'available'}`}>
                  {isSoldOut ? 'Sold Out' : (isNaN(product.price) || !product.price ? 'Price on Request' : `$${product.price.toFixed(2)}`)}
                </div>
                {/* Cold tolerance hardiness badge */}
                <div className="hardiness-badge">
                  Hardy to: {product.temp_threshold || '50'}°F
                </div>
              </div>

              {/* Bottom aligned button or Sold out text box */}
              <div style={{ width: '100%', marginTop: 'auto' }}>
                {isSoldOut ? (
                  <div className="sold-out-btn">
                    Sold Out
                  </div>
                ) : (
                  <Button
                    variant="green-filled"
                    href={`/product/${product.slug}`}
                    style={{
                      width: '100%',
                      marginTop: '0.6rem',
                      fontFamily: 'Crimson Text, Georgia, serif',
                      fontSize: '1rem',
                      padding: '0.5rem 1.4rem',
                      borderRadius: '18px',
                      boxSizing: 'border-box'
                    }}
                  >
                    View Plant
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .shop-container {
          max-width: 1100px;
          margin: 32px auto;
          padding: 1.5rem;
          box-sizing: border-box;
        }
        @media (max-width: 900px) {
          .shop-container {
            padding: 0.5rem;
          }
        }
        .shop-intro {
          max-width: 750px;
          margin: -1.0em auto 1.8em auto;
          font-size: 1.1rem;
          line-height: 1.6;
          color: #E9DCBE;
          text-align: center;
        }
        .products {
          display: flex;
          flex-wrap: wrap;
          gap: 1.2rem;
          justify-content: center;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .products {
            flex-direction: column;
            align-items: center;
          }
        }
        .product-card, .product-card * {
          box-sizing: border-box;
        }
        .product-card {
          background-color: #F5E7C4;
          border-radius: 10px;
          padding: 1rem;
          width: 220px;
          box-sizing: border-box;
          color: #1C3D2E;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.12s ease-in-out, box-shadow 0.12s ease-in-out;
          box-shadow: 0 3px 14px rgba(20,40,30,0.10);
          position: relative;
        }
        .product-card:hover {
          transform: translateY(-4px) scale(1.025);
          box-shadow: 0 5px 18px rgba(20,40,30,0.14);
          z-index: 2;
        }
        .product-card.sold-out {
          opacity: 0.55;
          pointer-events: none;
        }
        .product-card img {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 8px;
          background: #e9dcbe11;
          margin-bottom: 0.8rem;
          display: block;
        }
        .product-card strong {
          display: block;
          margin-top: 0.2rem;
          font-size: 1.22rem;
          font-family: Georgia, serif;
          line-height: 1.2;
          min-height: 3.2rem;
          color: #1C3D2E;
        }
        .product-card p {
          margin: 0.1rem 0;
          font-size: 1rem;
        }
        .price {
          font-weight: 700;
          margin: 0.5rem 0 0.2rem 0;
          font-size: 1.1rem;
        }
        .price.available {
          color: #249160;
        }
        .price.sold {
          color: #ba2f2f;
        }
        .hardiness-badge {
          font-size: 0.8rem;
          color: #3a604d;
          margin-top: 0.2rem;
          margin-bottom: 0.8rem;
        }
        .sold-out-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: #ba2f2f;
          color: #ffffff;
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-family: 'Crimson Text', Georgia, serif;
          z-index: 5;
        }
        .sold-out-btn {
          background: #ba2f2f;
          color: #ffffff;
          padding: 0.5rem;
          border-radius: 24px;
          text-align: center;
          font-weight: bold;
          width: 100%;
          box-sizing: border-box;
          font-size: 1rem;
          margin-top: 0.6rem;
        }
      `}</style>
    </div>
  );
}

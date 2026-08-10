import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Button from '../components/Button';
import { useWishlist } from '../context/WishlistContext';
import { isSanityConfigured, sanityClient } from '../lib/sanity';

// Static list of requested category collections
const COLLECTIONS = [
  { id: 'houseplants', name: 'Houseplants' },
  { id: 'orchids-tropicals', name: 'Orchids & Tropicals' },
  { id: 'fruit-trees', name: 'Fruit Trees' },
  { id: 'herbs-medicinal', name: 'Herbs & Medicinal' },
  { id: 'exotics-rare', name: 'Exotics & Rare' },
  { id: 'seeds', name: 'Seeds' }
];

export default function Shop() {
  const router = useRouter();
  const { toggleWishlist, wishlist } = useWishlist();

  // Raw fetched products list
  const [products, setProducts] = useState([]);

  // Real-time filtered & sorted products list
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Active Filter & Sort States
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [viewSoldOut, setViewSoldOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products from Sanity.io or local fallback
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

  // Initialize and synchronize states from URL query parameters
  useEffect(() => {
    if (!router.isReady) return;

    const { category, size, zone, sort, view_sold_out, search } = router.query;

    if (category !== undefined) setSelectedCategory(category || '');
    if (size !== undefined) setSelectedSize(size || '');
    if (zone !== undefined) setSelectedZone(zone || '');
    if (sort !== undefined) setSortOrder(sort || '');
    if (view_sold_out !== undefined) {
      setViewSoldOut(view_sold_out === 'true');
    } else {
      setViewSoldOut(false); // default to false (hides sold out plants)
    }
    if (search !== undefined) setSearchQuery(search || '');
  }, [router.isReady, router.query]);

  // Helper to update both local state and router query parameters synchronously (two-way sync)
  const updateFilters = (updates) => {
    const params = new URLSearchParams(window.location.search);

    if (updates.category !== undefined) {
      setSelectedCategory(updates.category);
      if (updates.category) params.set('category', updates.category);
      else params.delete('category');
    }
    if (updates.size !== undefined) {
      setSelectedSize(updates.size);
      if (updates.size) params.set('size', updates.size);
      else params.delete('size');
    }
    if (updates.zone !== undefined) {
      setSelectedZone(updates.zone);
      if (updates.zone) params.set('zone', updates.zone);
      else params.delete('zone');
    }
    if (updates.sort !== undefined) {
      setSortOrder(updates.sort);
      if (updates.sort) params.set('sort', updates.sort);
      else params.delete('sort');
    }
    if (updates.view_sold_out !== undefined) {
      setViewSoldOut(updates.view_sold_out);
      if (updates.view_sold_out) params.set('view_sold_out', 'true');
      else params.delete('view_sold_out');
    }
    if (updates.search !== undefined) {
      setSearchQuery(updates.search);
      if (updates.search) params.set('search', updates.search);
      else params.delete('search');
    }

    const newQuery = params.toString();
    router.replace(newQuery ? `?${newQuery}` : window.location.pathname, undefined, { shallow: true });
  };

  // Perform real-time filtering and sorting
  useEffect(() => {
    let result = [...products];

    // 1. Category Filter Logic with flexible mapping for collections
    if (selectedCategory) {
      const catLower = selectedCategory.toLowerCase();
      result = result.filter(product => {
        const hasCategory = (c) => Array.isArray(product.categories) && product.categories.some(pc => pc.toLowerCase() === c.toLowerCase());
        const hasTag = (t) => Array.isArray(product.tags) && product.tags.some(pt => pt.toLowerCase() === t.toLowerCase());
        const textMatches = (keyword) => {
          const text = `${product.name} ${product.description || ''}`.toLowerCase();
          return text.includes(keyword);
        };

        if (catLower === 'houseplants') {
          return hasCategory('houseplants') || hasTag('houseplant') || textMatches('houseplant');
        }
        if (catLower === 'orchids-tropicals' || catLower === 'orchids & tropicals') {
          return hasCategory('orchids-tropicals') || hasCategory('plants') || hasTag('tropical') || hasTag('orchid') || textMatches('orchid') || textMatches('tropical');
        }
        if (catLower === 'fruit-trees' || catLower === 'fruit trees') {
          return hasCategory('fruit-trees') || hasTag('fruit-tree') || textMatches('fruit tree') || textMatches('fruit');
        }
        if (catLower === 'herbs-medicinal' || catLower === 'herbs & medicinal') {
          return hasCategory('herbs-medicinal') || hasTag('herb') || hasTag('medicinal') || textMatches('herb') || textMatches('medicinal') || textMatches('aromatic');
        }
        if (catLower === 'exotics-rare' || catLower === 'exotics & rare') {
          return hasCategory('exotics-rare') || hasTag('rare') || hasTag('exotic') || textMatches('rare') || textMatches('exotic') || textMatches('unusual');
        }
        if (catLower === 'seeds') {
          return hasCategory('seeds') || hasTag('seed') || textMatches('seed');
        }

        // Exact fallback
        return hasCategory(selectedCategory);
      });
    }

    // 2. Hide Sold Out Filter (quantity < 3) by default (unless viewSoldOut is true)
    if (!viewSoldOut) {
      result = result.filter(p => {
        const isSold = !p.quantity || p.quantity < 3;
        return !isSold;
      });
    }

    // 3. Pot Size / Container Filter
    if (selectedSize) {
      result = result.filter(product => {
        if (!product.sizes || typeof product.sizes !== 'string') return false;
        const parts = product.sizes.split('|').map(p => p.trim().toLowerCase());
        return parts.includes(selectedSize.toLowerCase());
      });
    }

    // 4. Hardiness Zone Filter
    if (selectedZone) {
      result = result.filter(product => product.zones && product.zones.includes(selectedZone));
    }

    // 5. Search Text Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        let haystack = [p.name, p.type, p.description, p.sku].filter(Boolean).join(' ').toLowerCase();
        if (Array.isArray(p.categories)) haystack += ' ' + p.categories.join(' ').toLowerCase();
        if (Array.isArray(p.zones)) haystack += ' ' + p.zones.join(' ').toLowerCase();
        if (Array.isArray(p.tags)) haystack += ' ' + p.tags.join(' ').toLowerCase();
        return haystack.includes(q);
      });
    }

    // 6. Sort Logic
    if (sortOrder === 'price-low-to-high') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortOrder === 'price-high-to-low') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortOrder === 'alphabetical') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    // Always sort in-stock items to the top if viewSoldOut is true
    if (viewSoldOut) {
      result.sort((a, b) => {
        const aSold = !a.quantity || a.quantity < 3;
        const bSold = !b.quantity || b.quantity < 3;
        if (aSold && !bSold) return 1;
        if (!aSold && bSold) return -1;
        return 0; // maintain relative sorted order
      });
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedSize, selectedZone, sortOrder, viewSoldOut, searchQuery]);

  // Dynamically extract unique available hardiness zones (excluding extremely cold 1 & 2)
  const availableZones = new Set();
  products.forEach(prod => {
    if (Array.isArray(prod.zones)) {
      prod.zones.forEach(zone => {
        if (zone !== '1' && zone !== '2') {
          availableZones.add(zone);
        }
      });
    }
  });
  const sortedZones = Array.from(availableZones).sort((a, b) => parseFloat(a) - parseFloat(b));

  // Dynamically extract unique container options by splitting sizes by " | "
  const availableSizes = new Set();
  products.forEach(prod => {
    if (prod.sizes && typeof prod.sizes === 'string') {
      const parts = prod.sizes.split('|');
      parts.forEach(part => {
        const clean = part.trim();
        if (clean) {
          availableSizes.add(clean);
        }
      });
    }
  });
  const sortedSizes = Array.from(availableSizes).sort();

  // Helper to determine active in-stock count for collections dynamically
  const getActiveInStockCountForCategory = (categoryId) => {
    return products.filter(product => {
      const isSoldOut = !product.quantity || product.quantity < 3;
      if (isSoldOut) return false;

      const catLower = categoryId.toLowerCase();
      const hasCategory = (c) => Array.isArray(product.categories) && product.categories.some(pc => pc.toLowerCase() === c.toLowerCase());
      const hasTag = (t) => Array.isArray(product.tags) && product.tags.some(pt => pt.toLowerCase() === t.toLowerCase());
      const textMatches = (keyword) => {
        const text = `${product.name} ${product.description || ''}`.toLowerCase();
        return text.includes(keyword);
      };

      if (catLower === 'houseplants') {
        return hasCategory('houseplants') || hasTag('houseplant') || textMatches('houseplant');
      }
      if (catLower === 'orchids-tropicals' || catLower === 'orchids & tropicals') {
        return hasCategory('orchids-tropicals') || hasCategory('plants') || hasTag('tropical') || hasTag('orchid') || textMatches('orchid') || textMatches('tropical');
      }
      if (catLower === 'fruit-trees' || catLower === 'fruit trees') {
        return hasCategory('fruit-trees') || hasTag('fruit-tree') || textMatches('fruit tree') || textMatches('fruit');
      }
      if (catLower === 'herbs-medicinal' || catLower === 'herbs & medicinal') {
        return hasCategory('herbs-medicinal') || hasTag('herb') || hasTag('medicinal') || textMatches('herb') || textMatches('medicinal') || textMatches('aromatic');
      }
      if (catLower === 'exotics-rare' || catLower === 'exotics & rare') {
        return hasCategory('exotics-rare') || hasTag('rare') || hasTag('exotic') || textMatches('rare') || textMatches('exotic') || textMatches('unusual');
      }
      if (catLower === 'seeds') {
        return hasCategory('seeds') || hasTag('seed') || textMatches('seed');
      }

      return hasCategory(categoryId);
    }).length;
  };

  const visibleCollections = COLLECTIONS.filter(collection => {
    if (products.length === 0) return true; // keep visible during initial load
    return getActiveInStockCountForCategory(collection.id) > 0;
  });

  return (
    <div className="shop-container">
      {/* Page Heading styled strictly using Cinzel serif with uppercase spacing */}
      <h1 className="shop-title">
        Shop All Plants
      </h1>

      {/* Local Pickup Banner */}
      <div className="pickup-banner">
        <strong>Local Pickup Only</strong>&nbsp;–&nbsp;All purchases are available for pick&nbsp;up at our nursery in St.&nbsp;Petersburg, FL. We do not ship at this time.
      </div>

      {/* Structured Comprehensive Filter Bar Panel */}
      <div className="filter-panel">
        <p className="shop-intro">
          Browse our curated selection of rare and resilient tropical plants grown in St.&nbsp;Petersburg. Use the filters to explore categories like Medicinal, Culinary, Fragrant, Flowering Trees, Seeds, Rare &amp; Unusual, Best Plants for Your Zone and more. All listings reflect live inventory—quantities are limited and updated daily.
        </p>
        <p className="shop-subtext">
          Browse our curated selection of plants grown and sourced for our St.&nbsp;Petersburg and Tampa Bay community. We stock tropical houseplants, fruit trees and edibles, orchids, and hardy landscape plants. Inventory changes regularly, so check back often or drop us a note if you're looking for something special.
        </p>

        {/* Category Pill Buttons */}
        <div className="category-section">
          <label className="filter-group-label">Collections:</label>
          <div className="category-pills">
            <button
              onClick={() => updateFilters({ category: '' })}
              className={selectedCategory === '' ? 'active' : ''}
            >
              Shop All
            </button>
            {visibleCollections.map(collection => (
              <button
                key={collection.id}
                onClick={() => updateFilters({ category: collection.id })}
                className={selectedCategory === collection.id ? 'active' : ''}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Select Filters and Inputs Grid */}
        <div className="filters-grid">

          {/* Search Filter Input */}
          <div className="filter-control">
            <label htmlFor="search-input">Search Plants</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by name, type..."
              value={searchQuery}
              onChange={(e) => updateFilters({ search: e.target.value })}
              aria-label="Search plants"
            />
          </div>

          {/* Pot Size / Container Filter Dropdown */}
          <div className="filter-control">
            <label htmlFor="size-select">Pot Size / Container</label>
            <select
              id="size-select"
              value={selectedSize}
              onChange={(e) => updateFilters({ size: e.target.value })}
            >
              <option value="">All Sizes</option>
              {sortedSizes.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Hardiness Zone Filter Dropdown */}
          <div className="filter-control">
            <label htmlFor="zone-select">Hardiness Zone</label>
            <select
              id="zone-select"
              value={selectedZone}
              onChange={(e) => updateFilters({ zone: e.target.value })}
            >
              <option value="">All Zones</option>
              {sortedZones.map(zone => (
                <option key={zone} value={zone}>
                  Zone {zone}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options Dropdown */}
          <div className="filter-control">
            <label htmlFor="sort-select">Sort By</label>
            <select
              id="sort-select"
              value={sortOrder}
              onChange={(e) => updateFilters({ sort: e.target.value })}
            >
              <option value="">Featured / Newest</option>
              <option value="price-low-to-high">Price: Low to High</option>
              <option value="price-high-to-low">Price: High to Low</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>

        </div>

        {/* View Sold Out Toggle Button */}
        <div className="toggle-section">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={viewSoldOut}
              onChange={(e) => updateFilters({ view_sold_out: e.target.checked })}
              className="toggle-checkbox"
            />
            View Sold Out Plants
          </label>
        </div>

      </div>

      {/* Results Count Summary */}
      <div className="results-count">
        Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'plant' : 'plants'}
      </div>

      {/* Products Grid */}
      {selectedCategory && products.length > 0 && getActiveInStockCountForCategory(selectedCategory) === 0 ? (
        <div style={{
          width: '100%',
          maxWidth: '800px',
          margin: '2rem auto',
          background: '#00301E',
          border: '1px solid #D4B06A',
          padding: '3rem 2rem',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#F5E7C4',
          boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          fontFamily: "'Crimson Text', serif",
          boxSizing: 'border-box'
        }}>
          <h3 style={{
            color: '#D4B06A',
            fontFamily: "'Cinzel', serif",
            fontSize: '1.8rem',
            margin: '0 0 1rem 0',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            Upcoming Batch / Gathering Inventory
          </h3>
          <p style={{
            fontSize: '1.25rem',
            lineHeight: '1.6',
            maxWidth: '650px',
            margin: '0 auto'
          }}>
            This batch is currently out of stock as we grow our next generation—check back soon or browse our available inventory above.
          </p>
        </div>
      ) : (
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
                  className="wishlist-heart-btn"
                  aria-label="Add to wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={isWishlisted ? '#ba2f2f' : 'none'}
                    stroke={isWishlisted ? '#ba2f2f' : '#D4B06A'}
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
                <div className="product-card-top">
                  <Link href={`/product/${product.slug}`} className="product-link">
                    <div className="product-image-container">
                      <Image
                        src={product.image || '/assets/placeholder.png'}
                        alt={product.name}
                        fill
                        sizes="220px"
                        className="product-image"
                        unoptimized={!product.image || !product.image.includes('cdn.sanity.io')}
                      />
                    </div>
                    <strong className="product-card-title">
                      {product.name}
                    </strong>
                  </Link>
                  <p className="product-sizes">{product.sizes || 'Standard Pot'}</p>
                  <p className="product-type">{product.type}</p>
                  <div className={`price ${isSoldOut ? 'sold' : 'available'}`}>
                    {isSoldOut ? 'Sold Out' : (isNaN(product.price) || !product.price ? 'Price on Request' : `$${product.price.toFixed(2)}`)}
                  </div>
                  {/* Cold tolerance hardiness badge */}
                  <div className="hardiness-badge">
                    Hardy to: {product.temp_threshold || '50'}°F
                  </div>
                </div>

                {/* Bottom aligned button or Sold out text box */}
                <div className="product-card-bottom">
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
                        fontFamily: "'Crimson Text', serif",
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
      )}

      {/* Styled JSX strictly using Cinzel and Crimson Text font tokens and our verified color design tokens */}
      <style jsx>{`
        .shop-container {
          max-width: 1150px;
          margin: 32px auto;
          padding: 1.5rem;
          box-sizing: border-box;
          font-family: 'Crimson Text', serif;
          color: #F5E7C4;
        }

        @media (max-width: 900px) {
          .shop-container {
            padding: 0.5rem;
          }
        }

        .shop-title {
          color: #E9DCBE;
          font-size: 2.5rem;
          text-align: center;
          letter-spacing: 0.15em;
          margin-top: 0.3em;
          margin-bottom: 1.2em;
          font-family: 'Cinzel', serif;
          text-transform: uppercase;
        }

        .pickup-banner {
          background: #D4B06A;
          color: #00301E;
          padding: 0.8rem 1.2rem;
          border-radius: 10px;
          margin-bottom: 1rem;
          text-align: center;
          font-size: 1.05rem;
          font-family: 'Crimson Text', serif;
        }

        .shop-intro {
          max-width: 750px;
          margin: 0 auto 1rem auto;
          font-size: 1.15rem;
          line-height: 1.6;
          color: #F5E7C4;
          text-align: center;
          font-family: 'Crimson Text', serif;
        }

        .filter-panel {
          background: #00301E;
          border: 1px solid #D4B06A;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }

        .filter-group-label {
          font-size: 1.1rem;
          font-weight: bold;
          color: #D4B06A;
          margin-bottom: 0.5rem;
          display: block;
          font-family: 'Crimson Text', serif;
        }

        .category-section {
          margin-bottom: 1.5rem;
        }

        .category-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 0.6rem;
        }

        .category-pills button {
          background: transparent;
          color: #F5E7C4;
          border: 1px solid rgba(212, 176, 106, 0.4);
          border-radius: 20px;
          padding: 0.4rem 1rem;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .category-pills button:hover {
          border-color: #D4B06A;
          background: rgba(212, 176, 106, 0.1);
        }

        .category-pills button.active {
          background: #D4B06A;
          color: #00301E;
          border-color: #D4B06A;
          font-weight: bold;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.2rem;
          margin-bottom: 1.2rem;
        }

        .filter-control {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .filter-control label {
          font-size: 0.95rem;
          color: #D4B06A;
          font-weight: bold;
          font-family: 'Crimson Text', serif;
        }

        .filter-control input,
        .filter-control select {
          padding: 0.5rem 0.8rem;
          border-radius: 8px;
          border: 1px solid rgba(212, 176, 106, 0.4);
          background: #F5E7C4;
          color: #00301E;
          font-family: 'Crimson Text', serif;
          font-size: 1rem;
          outline: none;
          box-sizing: border-box;
          transition: border-color 0.2s ease;
        }

        .filter-control input:focus,
        .filter-control select:focus {
          border-color: #D4B06A;
        }

        .toggle-section {
          display: flex;
          align-items: center;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(212, 176, 106, 0.2);
        }

        .toggle-label {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          cursor: pointer;
          color: #F5E7C4;
          font-size: 1.05rem;
          font-family: 'Crimson Text', serif;
        }

        .toggle-checkbox {
          width: 18px;
          height: 18px;
          accent-color: #D4B06A;
          cursor: pointer;
        }

        .shop-subtext {
          max-width: 750px;
          margin: 0 auto 1.5rem auto;
          font-size: 1.05rem;
          line-height: 1.5;
          text-align: center;
          color: #E9DCBE;
          font-family: 'Crimson Text', serif;
          border-bottom: 1px solid rgba(212, 176, 106, 0.3);
          padding-bottom: 1.5rem;
        }

        .results-count {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.1rem;
          color: #D4B06A;
          font-weight: bold;
          font-family: 'Crimson Text', serif;
        }

        .products {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          justify-content: center;
          align-items: stretch;
        }

        @media (max-width: 900px) {
          .products {
            flex-direction: column;
            align-items: center;
          }
        }

        .product-card {
          background-color: #F5E7C4;
          border-radius: 10px;
          padding: 1.2rem;
          width: 250px;
          box-sizing: border-box;
          color: #00301E;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
          box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.25);
          z-index: 2;
        }

        .product-card.sold-out {
          opacity: 0.6;
        }

        .wishlist-heart-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          cursor: pointer;
          z-index: 10;
          padding: 4px;
          transition: transform 0.1s ease;
          filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));
        }

        .wishlist-heart-btn:hover {
          transform: scale(1.1);
        }

        .sold-out-badge {
          position: absolute;
          top: 12px;
          left: 12px;
          background: #ba2f2f;
          color: #ffffff;
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
          font-family: 'Crimson Text', serif;
          z-index: 5;
        }

        .product-card-top {
          display: flex;
          flex-direction: column;
          width: 100%;
          flex-grow: 1;
          text-align: center;
        }

        .product-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .product-image-container {
          position: relative;
          width: 100%;
          height: 180px;
          margin-bottom: 0.8rem;
        }

        .product-image {
          object-fit: cover;
          border-radius: 8px;
          background: rgba(0,0,0,0.05);
        }

        .product-card-title {
          display: block;
          margin-top: 0.4rem;
          font-size: 1.3rem;
          font-family: 'Cinzel', serif;
          line-height: 1.2;
          min-height: 3.2rem;
          color: #00301E;
        }

        .product-sizes {
          margin: 0.2rem 0;
          font-size: 1rem;
          color: #555;
          font-family: 'Crimson Text', serif;
        }

        .product-type {
          margin: 0.1rem 0;
          font-size: 1rem;
          color: #00301E;
          font-family: 'Crimson Text', serif;
        }

        .price {
          font-weight: bold;
          margin: 0.6rem 0 0.3rem 0;
          font-size: 1.15rem;
          font-family: 'Crimson Text', serif;
        }

        .price.available {
          color: #11402A;
        }

        .price.sold {
          color: #ba2f2f;
        }

        .hardiness-badge {
          font-size: 0.85rem;
          color: #3a604d;
          margin-top: 0.2rem;
          margin-bottom: 0.8rem;
          font-family: 'Crimson Text', serif;
        }

        .product-card-bottom {
          width: 100%;
          marginTop: auto;
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
          font-family: 'Crimson Text', serif;
        }
      `}</style>
    </div>
  );
}

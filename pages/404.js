import SEO from "../components/SEO";
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import Button from '../components/Button';
import { getAllProducts } from '../lib/shopify';

export default function Custom404() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [matchingProducts, setMatchingProducts] = useState([]);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await getAllProducts();
        if (Array.isArray(products)) {
          setAllProducts(products);
        }
      } catch (err) {
        console.error('Error fetching products for 404 search:', err);
      }
    }
    loadProducts();
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (!query.trim()) {
      setMatchingProducts([]);
      return;
    }

    const q = query.trim().toLowerCase();
    const filtered = allProducts.filter((p) => {
      const name = (p?.name || p?.title || '').toLowerCase();
      const tags = Array.isArray(p?.tags) ? p.tags.join(' ').toLowerCase() : '';
      const category = (p?.category || '').toLowerCase();
      return name.includes(q) || tags.includes(q) || category.includes(q);
    }).slice(0, 5);

    setMatchingProducts(filtered);
  };

  return (
    <div className="not-found-container">
      <SEO title="404 - Page Not Found" description="The botanical specimen or path you requested could not be found. Explore our nursery catalog or return home." />

      <div className="not-found-card">
        <div className="not-found-badge">404 &bull; Sanctuary Misdirection</div>
        <h1 className="not-found-title">Path Not Found</h1>
        <p className="not-found-subtitle">
          It appears this botanical path has grown over or moved deeper into the nursery. Let us guide you back to thriving grounds.
        </p>

        {/* Predictive Search Component */}
        <div className="search-section">
          <label htmlFor="404-search-input" className="search-label">
            Search Our Botanical Catalog
          </label>
          <div className="search-input-wrapper">
            <input
              id="404-search-input"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search for houseplants, orchids, fruit trees, or care guides..."
              className="search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setMatchingProducts([]);
                }}
                className="search-clear-btn"
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>

          {matchingProducts.length > 0 && (
            <div className="search-dropdown">
              {matchingProducts.map((p) => {
                const slug = p?.slug?.current || p?.slug || '';
                const imageSrc = p?.image || p?.imageUrl || '/assets/placeholder.png';
                return (
                  <Link key={slug || p.id} href={`/product/${slug}`} className="search-result-item">
                    <div className="result-thumb-wrapper">
                      <Image
                        src={imageSrc.startsWith('http') || imageSrc.startsWith('/') ? imageSrc : '/' + imageSrc}
                        alt={p.name || p.title}
                        fill
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className="result-info">
                      <span className="result-title">{p.name || p.title}</span>
                      <span className="result-price">
                        {typeof p.price === 'number' ? `$${p.price.toFixed(2)}` : p.price}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Recovery Action CTA Buttons */}
        <div className="cta-row">
          <Button variant="gold-filled" href="/shop">
            Explore Shop (/shop)
          </Button>
          <Button variant="outline" href="/">
            Return Home (/)
          </Button>
        </div>
      </div>

      <style jsx>{`
        .not-found-container {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          color: #f5e7c4;
          font-family: 'Crimson Text', serif;
        }

        .not-found-card {
          max-width: 680px;
          width: 100%;
          background-color: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 14px;
          padding: 3rem 2.5rem;
          text-align: center;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
          box-sizing: border-box;
        }

        .not-found-badge {
          display: inline-block;
          background-color: #123826;
          color: #d4b06a;
          border: 1px solid rgba(212, 176, 106, 0.4);
          border-radius: 20px;
          padding: 0.35rem 1rem;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 1.2rem;
        }

        .not-found-title {
          font-family: 'Cinzel', serif;
          color: #d4b06a;
          font-size: 2.4rem;
          margin: 0 0 0.8rem 0;
          letter-spacing: 0.05em;
        }

        .not-found-subtitle {
          font-size: 1.15rem;
          color: #e9dcbe;
          line-height: 1.6;
          margin: 0 0 2rem 0;
        }

        .search-section {
          position: relative;
          margin-bottom: 2.2rem;
          text-align: left;
        }

        .search-label {
          display: block;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          color: #d4b06a;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .search-input-wrapper {
          position: relative;
          width: 100%;
        }

        .search-input {
          width: 100%;
          box-sizing: border-box;
          padding: 0.85rem 2.5rem 0.85rem 1rem;
          background-color: #123826;
          border: 1px solid rgba(212, 176, 106, 0.4);
          border-radius: 8px;
          color: #f5e7c4;
          font-family: 'Crimson Text', serif;
          font-size: 1.05rem;
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .search-input:focus {
          border-color: #d4b06a;
          box-shadow: 0 0 0 2px rgba(212, 176, 106, 0.25);
        }

        .search-clear-btn {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: #d4b06a;
          font-size: 1rem;
          cursor: pointer;
          padding: 0;
        }

        .search-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          margin-top: 6px;
          background-color: #123826;
          border: 1px solid #d4b06a;
          border-radius: 8px;
          overflow: hidden;
          z-index: 20;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #f5e7c4;
          border-bottom: 1px solid rgba(212, 176, 106, 0.15);
          transition: background-color 0.15s ease;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-item:hover {
          background-color: #1c3d2e;
        }

        .result-thumb-wrapper {
          position: relative;
          width: 42px;
          height: 42px;
          border-radius: 6px;
          overflow: hidden;
          flex-shrink: 0;
          background-color: #00301e;
        }

        .result-info {
          display: flex;
          flex-direction: column;
        }

        .result-title {
          font-family: 'Cinzel', serif;
          font-size: 0.95rem;
          color: #d4b06a;
        }

        .result-price {
          font-size: 0.88rem;
          color: #e9dcbe;
        }

        .cta-row {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 600px) {
          .not-found-card {
            padding: 2rem 1.2rem;
          }

          .not-found-title {
            font-size: 1.8rem;
          }

          .cta-row {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}

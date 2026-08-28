import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import NurseryUpdateFallback from '../../components/NurseryUpdateFallback';
import { getAllProducts } from '../../lib/shopify';
import { isZoneCompatible, normalizePotSize, getProductSizes, getAvailableZones } from '../../lib/fulfillment';

const KNOWN_COLLECTIONS = {
  'orchids': 'Orchids',
  'tropical-houseplants': 'Tropical Houseplants',
  'houseplants': 'Tropical Houseplants',
  'fruit-trees': 'Fruit Trees',
  'exotics-rare': 'Exotics & Rare',
  'herbs-medicinal': 'Herbs & Medicinal',
  'seeds': 'Seeds',
  'stickers-art': 'Stickers & Art',
  'tinctures-apothecary': 'Tinctures & Apothecary',
  'terrarium-vivarium': 'Terrarium & Vivarium',
};

const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getStaticPaths() {
  try {
    const products = await getAllProducts();
    const handles = new Set(Object.keys(KNOWN_COLLECTIONS));

    (products || []).forEach((product) => {
      if (Array.isArray(product.collectionHandles)) {
        product.collectionHandles.forEach((h) => {
          if (h && KEBAB_CASE_REGEX.test(h)) {
            handles.add(h.toLowerCase());
          }
        });
      }
    });

    const paths = Array.from(handles).map((slug) => ({
      params: { slug },
    }));

    return {
      paths,
      fallback: 'blocking',
    };
  } catch (error) {
    console.error('Error in collections getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking',
    };
  }
}

export async function getStaticProps({ params }) {
  const slug = params?.slug?.toLowerCase();

  if (!slug || !KEBAB_CASE_REGEX.test(slug)) {
    return {
      notFound: true,
      revalidate: 60,
    };
  }

  try {
    const products = await getAllProducts();

    let collectionTitle = KNOWN_COLLECTIONS[slug] || null;

    // Search for collection title from product collection objects if not in KNOWN_COLLECTIONS
    if (!collectionTitle) {
      for (const p of products || []) {
        if (Array.isArray(p.collections)) {
          const match = p.collections.find((c) => c.handle?.toLowerCase() === slug);
          if (match && match.title) {
            collectionTitle = match.title;
            break;
          }
        }
      }
    }

    if (!collectionTitle) {
      collectionTitle = slug
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // Filter matching products for this collection
    const collectionProducts = (products || []).filter((product) => {
      const matchesCollectionHandle = (handle) =>
        Array.isArray(product?.collectionHandles) &&
        product.collectionHandles.some((h) => h?.toLowerCase() === handle.toLowerCase());
      const matchesCategory = (cat) =>
        Array.isArray(product?.categories) &&
        product.categories.some((pc) => pc?.toLowerCase() === cat.toLowerCase());
      const matchesTag = (t) =>
        Array.isArray(product?.tags) &&
        product.tags.some((pt) => pt?.toLowerCase() === t.toLowerCase());
      const textMatches = (keyword) =>
        `${product?.name || ''} ${product?.description || ''}`
          .toLowerCase()
          .includes(keyword.toLowerCase());

      if (matchesCollectionHandle(slug) || matchesCategory(slug) || matchesTag(slug)) return true;

      if (slug === 'orchids' || slug === 'orchid') {
        return matchesTag('orchid') || matchesCategory('orchids') || textMatches('orchid');
      }
      if (slug === 'tropical-houseplants' || slug === 'houseplants') {
        return (
          matchesTag('houseplant') ||
          matchesTag('tropical') ||
          matchesCategory('houseplants') ||
          matchesCategory('tropical-houseplants') ||
          textMatches('houseplant') ||
          textMatches('tropical')
        );
      }
      if (slug === 'fruit-trees' || slug === 'fruit-tree') {
        return matchesTag('fruit-tree') || textMatches('fruit tree') || textMatches('fruit');
      }
      if (slug === 'herbs-medicinal' || slug === 'herbs-and-medicinal') {
        return matchesTag('herb') || matchesTag('medicinal') || textMatches('herb') || textMatches('medicinal');
      }
      if (slug === 'exotics-rare' || slug === 'exotics-and-rare') {
        return matchesTag('rare') || matchesTag('exotic') || textMatches('rare') || textMatches('exotic');
      }
      if (slug === 'seeds') {
        return matchesTag('seed') || textMatches('seed');
      }
      if (slug === 'stickers-art') {
        return matchesCategory('art') || matchesTag('sticker') || matchesTag('art') || textMatches('sticker') || textMatches('art');
      }
      if (slug === 'tinctures-apothecary') {
        return matchesCategory('apothecary') || matchesTag('tincture') || matchesTag('apothecary') || textMatches('tincture');
      }
      if (slug === 'terrarium-vivarium') {
        return matchesCategory('habitat') || matchesTag('leaf-litter') || matchesTag('substrate') || textMatches('vivarium') || textMatches('terrarium');
      }

      return false;
    });

    return {
      props: {
        slug,
        collectionTitle,
        collectionProducts: collectionProducts || [],
        allProducts: products || [],
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error(`Error fetching collection ${slug} in getStaticProps:`, error);
    throw error;
  }
}

export default function CollectionPage({ slug, collectionTitle, collectionProducts = [], allProducts = [] }) {
  const router = useRouter();

  const [sortOrder, setSortOrder] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [viewSoldOut, setViewSoldOut] = useState(false);

  if (router.isFallback) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#D4B06A' }}>Loading collection...</div>;
  }

  const filteredProducts = useMemo(() => {
    let result = [...collectionProducts];

    if (!viewSoldOut) {
      result = result.filter((p) => p?.availableForSale !== false && (p?.quantity === undefined || p?.quantity >= 1));
    }

    if (selectedSize) {
      const sizeLower = selectedSize.toLowerCase();
      result = result.filter((product) => {
        if (product?.custom?.pot_size && product.custom.pot_size.toLowerCase().includes(sizeLower)) return true;
        if (product?.sizes && typeof product.sizes === 'string') {
          return product.sizes.split('|').map((p) => p.trim().toLowerCase()).some((p) => p.includes(sizeLower));
        }
        return false;
      });
    }

    if (selectedZone) {
      result = result.filter((product) => isZoneCompatible(selectedZone, product));
    }

    if (sortOrder === 'price-low-to-high') {
      result.sort((a, b) => (a?.minVariantPrice ?? a?.price ?? 0) - (b?.minVariantPrice ?? b?.price ?? 0));
    } else if (sortOrder === 'price-high-to-low') {
      result.sort((a, b) => (b?.minVariantPrice ?? b?.price ?? 0) - (a?.minVariantPrice ?? a?.price ?? 0));
    } else if (sortOrder === 'alphabetical') {
      result.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
    } else {
      result.sort((a, b) => new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime());
    }

    return result;
  }, [collectionProducts, viewSoldOut, selectedSize, selectedZone, sortOrder]);

  const sortedSizes = useMemo(() => {
    const set = new Set();
    collectionProducts.forEach((prod) => {
      if (prod?.custom?.pot_size) set.add(prod.custom.pot_size.trim());
      if (prod?.sizes && typeof prod.sizes === 'string') {
        prod.sizes.split('|').forEach((s) => s.trim() && set.add(s.trim()));
      }
    });
    return Array.from(set).sort();
  }, [collectionProducts]);

  const sortedZones = useMemo(() => {
    const set = new Set();
    collectionProducts.forEach((prod) => {
      if (prod?.custom?.hardiness_zone) set.add(prod.custom.hardiness_zone.trim());
      if (Array.isArray(prod?.zones)) prod.zones.forEach((z) => z && z !== '1' && z !== '2' && set.add(z));
    });
    return Array.from(set).sort((a, b) => parseFloat(a) - parseFloat(b) || a.localeCompare(b));
  }, [collectionProducts]);

  const SITE_ORIGIN = 'https://thebotanicalbazaar.com';
  const canonicalUrl = `${SITE_ORIGIN}/collections/${slug}`;
  const pageTitle = `${collectionTitle} Collection | The Botanical Bazaar St. Petersburg FL`;
  const metaDescription = `Discover our ${collectionTitle} collection at The Botanical Bazaar in St. Petersburg, FL. Specimen plants grown with care for nationwide shipping and local nursery pickup.`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': SITE_ORIGIN,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Shop',
        'item': `${SITE_ORIGIN}/shop`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': collectionTitle,
        'item': canonicalUrl,
      },
    ],
  };

  return (
    <div className="collection-container">
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content="https://thebotanicalbazaar.com/assets/brand-banner.png" />
        <script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </Head>

      <div className="breadcrumbs">
        <Link href="/">Home</Link> &rsaquo; <Link href="/shop">Shop</Link> &rsaquo; <span>{collectionTitle}</span>
      </div>

      <h1 className="collection-title">{collectionTitle}</h1>

      <p className="collection-intro">
        Explore our curated selection of {collectionTitle.toLowerCase()} specimens. Shipped nationwide from St.&nbsp;Petersburg, FL or available for free local nursery pickup.
      </p>

      {/* Filter & Sort Controls Bar */}
      <div className="collection-toolbar">
        <div className="filter-control">
          <select
            id="size-select"
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value)}
            aria-label="Filter by pot size"
          >
            <option value="">All Sizes</option>
            {sortedSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-control">
          <select
            id="zone-select"
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            aria-label="Filter by hardiness zone"
          >
            <option value="">All Hardiness Zones</option>
            {sortedZones.map((zone) => (
              <option key={zone} value={zone}>
                Zone {zone}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-control">
          <select
            id="sort-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            aria-label="Sort collection catalog"
          >
            <option value="">Featured / Newest</option>
            <option value="price-low-to-high">Price: Low to High</option>
            <option value="price-high-to-low">Price: High to Low</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
          </select>
        </div>

        <div className="filter-control toggle-control">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={viewSoldOut}
              onChange={(e) => setViewSoldOut(e.target.checked)}
              className="toggle-checkbox"
            />
            Include Sold Out
          </label>
        </div>

        <div className="results-count" role="status" aria-live="polite">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'specimen' : 'specimens'}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="empty-collection-box">
          <h3>Upcoming Batch / Nursery Update</h3>
          <p>
            No specimens are currently available in the {collectionTitle} collection. Our St. Petersburg nursery bench is propagating the next release batch.
          </p>
          <div className="empty-actions">
            <Button variant="gold-filled" href="/sourcing">
              Request Specimen &rsaquo;
            </Button>
            <Button variant="outline" href="/shop">
              Browse All Plants
            </Button>
          </div>
        </div>
      ) : (
        <div className="products">
          {filteredProducts.map((product) => (
            <ProductCard key={product?.slug || product?.id} product={product} />
          ))}
        </div>
      )}

      <style jsx>{`
        .collection-container {
          max-width: 1150px;
          margin: 16px auto 32px auto;
          padding: 0.75rem 1rem;
          box-sizing: border-box;
          font-family: 'Crimson Text', serif;
          color: #f5e7c4;
        }

        .breadcrumbs {
          font-size: 0.9rem;
          color: #D4B06A;
          margin-bottom: 1rem;
        }

        .breadcrumbs :global(a) {
          color: #D4B06A;
          text-decoration: underline;
        }

        .breadcrumbs span {
          color: #F5E7C4;
        }

        .collection-title {
          color: #e9dcbe;
          font-size: 2.2rem;
          text-align: center;
          letter-spacing: 0.12em;
          margin-top: 0;
          margin-bottom: 0.4em;
          font-family: 'Cinzel', serif;
          text-transform: uppercase;
        }

        .collection-intro {
          max-width: 750px;
          margin: 0 auto 1.5rem auto;
          font-size: 1.1rem;
          line-height: 1.45;
          color: #e9dcbe;
          text-align: center;
        }

        .collection-toolbar {
          background: #00301e;
          border: 1px solid #d4b06a;
          border-radius: 10px;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.6rem;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .filter-control select {
          padding: 0.35rem 0.6rem;
          border-radius: 6px;
          border: 1px solid rgba(212, 176, 106, 0.4);
          background: #f5e7c4;
          color: #00301e;
          font-family: 'Crimson Text', serif;
          font-size: 0.9rem;
          outline: none;
          height: 32px;
        }

        .toggle-control {
          margin-left: 0.2rem;
        }

        .toggle-label {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          cursor: pointer;
          color: #f5e7c4;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .toggle-checkbox {
          width: 15px;
          height: 15px;
          accent-color: #d4b06a;
          cursor: pointer;
        }

        .results-count {
          margin-left: auto;
          font-size: 0.9rem;
          color: #d4b06a;
          font-weight: bold;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
          justify-content: center;
          align-items: stretch;
          max-width: 1100px;
          margin: 0 auto;
        }

        .empty-collection-box {
          max-width: 800px;
          margin: 2rem auto;
          background: #00301e;
          border: 1px solid #d4b06a;
          padding: 3rem 2rem;
          border-radius: 12px;
          text-align: center;
          color: #f5e7c4;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        }

        .empty-collection-box h3 {
          color: #d4b06a;
          font-family: 'Cinzel', serif;
          font-size: 1.8rem;
          margin: 0 0 1rem 0;
          text-transform: uppercase;
        }

        .empty-collection-box p {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        @media (max-width: 1023px) and (min-width: 640px) {
          .products {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 639px) {
          .collection-title {
            font-size: 1.7rem;
          }
          .collection-toolbar {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-control select {
            width: 100%;
          }
          .results-count {
            margin-left: 0;
            text-align: center;
          }
          .products {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function ProductDetail() {
  const router = useRouter();
  const { slug } = router.query;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist } = useWishlist();

  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState('');

  // Carousel hooks, states, and selection logic
  const carouselRef = React.useRef(null);
  const [isHovered, setIsHovered] = React.useState(false);
  const [carouselProducts, setCarouselProducts] = React.useState([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftState, setScrollLeftState] = React.useState(0);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadAll = () => {
        setCarouselProducts(window.PRODUCTS || []);
      };
      if (window.PRODUCTS) {
        loadAll();
      } else {
        const scr = document.createElement('script');
        scr.src = '/products.js';
        scr.onload = loadAll;
        document.body.appendChild(scr);
      }
    }
  }, []);

  React.useEffect(() => {
    const el = carouselRef.current;
    if (!el || isHovered || isDragging) return;

    const intervalId = setInterval(() => {
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
        el.scrollLeft = 0;
      } else {
        el.scrollLeft += 1;
      }
    }, 35); // smooth slow incremental crawl

    return () => clearInterval(intervalId);
  }, [isHovered, isDragging, carouselProducts]);

  const handleMouseDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeftState(el.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const el = carouselRef.current;
    if (!el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 1.5;
    el.scrollLeft = scrollLeftState - walk;
  };

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const getRelatedProducts = () => {
    if (carouselProducts.length === 0) return [];

    // Exclude current displayed product
    const otherPlants = carouselProducts.filter(p => p.slug !== product?.slug);
    if (!product) return otherPlants.slice(0, 8);

    const currentCategories = Array.isArray(product.categories) ? product.categories : [];
    const currentTags = Array.isArray(product.tags) ? product.tags : [];
    const lightTags = ['bright-indirect', 'full-sun', 'low-light'];
    const currentLightTags = currentTags.filter(t => lightTags.includes(t));

    const scored = otherPlants.map(p => {
      let score = 0;

      // Match category
      const pCategories = Array.isArray(p.categories) ? p.categories : [];
      pCategories.forEach(c => {
        if (currentCategories.some(cc => cc.toLowerCase() === c.toLowerCase())) {
          score += 10;
        }
      });

      // Match type
      if (p.type && product.type && p.type.toLowerCase() === product.type.toLowerCase()) {
        score += 5;
      }

      // Match light requirements
      const pTags = Array.isArray(p.tags) ? p.tags : [];
      pTags.forEach(t => {
        if (currentLightTags.includes(t)) {
          score += 5;
        }
      });

      return { product: p, score };
    });

    // Sort by descending score
    scored.sort((a, b) => b.score - a.score);
    let related = scored.map(s => s.product);

    // General in-stock plants fallback if fewer than 4 category matches exist
    const categoryMatches = scored.filter(s => s.score >= 10).map(s => s.product);
    if (categoryMatches.length < 4) {
      // Pull general in-stock items
      const inStockOthers = otherPlants.filter(p => p.quantity >= 3 && !categoryMatches.some(r => r.slug === p.slug));
      related = [...categoryMatches, ...inStockOthers];
    }

    // Keep top 8 matching/fallback products
    return related.slice(0, 8);
  };

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.trim()) return;

    setNotifyLoading(true);
    setNotifyError('');

    try {
      const response = await fetch('/api/notify-me', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: notifyEmail.trim(),
          slug: product.slug,
          name: product.name
        })
      });

      const data = await response.json();
      if (response.ok) {
        setNotifySubscribed(true);
      } else {
        setNotifyError(data.error || 'Failed to submit. Please try again.');
      }
    } catch (err) {
      console.error('Error submitting notify me request:', err);
      setNotifyError('An error occurred. Please try again.');
    } finally {
      setNotifyLoading(false);
    }
  };

  useEffect(() => {
    if (!slug) return;

    const findProduct = () => {
      const all = window.PRODUCTS || [];
      const item = all.find(p => p.slug === slug);
      setProduct(item);
      if (item && item.sizes) {
        setSelectedSize(item.sizes.split('|')[0].trim());
      }
      setLoading(false);
    };

    if (window.PRODUCTS) {
      findProduct();
    } else {
      const script = document.createElement('script');
      script.src = '/products.js';
      script.onload = findProduct;
      document.body.appendChild(script);
    }
  }, [slug]);

  // Dynamic redirect for inactive/non-existent product pages straight back to /shop
  useEffect(() => {
    if (!loading && !product) {
      router.replace('/shop');
    }
  }, [loading, product, router]);

  if (loading) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#D4B06A' }}>Loading plant details...</div>;
  }

  if (!product) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center' }}>
        <h2 style={{ color: '#D4B06A' }}>Plant Not Found</h2>
        <p>Sorry, the tropical plant you are looking for is not in our current catalog.</p>
        <Button variant="gold-filled" href="/shop">Back to Shop</Button>
      </div>
    );
  }

  // Treat any quantity below three as sold out to match legacy stock policy
  const isSoldOut = !product.quantity || product.quantity < 3;
  const isWishlisted = wishlist.some(item => item.slug === product.slug);
  const sizesArray = product.sizes ? product.sizes.split('|').map(s => s.trim()) : [];

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    router.push('/cart');
  };

  const renderSpecs = (productObj) => {
    const tags = Array.isArray(productObj.tags) ? productObj.tags : [];

    const createPanel = (title, items) => {
      if (!items || items.length === 0) return null;
      return (
        <details key={title} className="plant-spec-detail">
          <summary className="plant-spec-summary">{title}</summary>
          <ul className="plant-spec-list">
            {items.map((item, idx) => (
              <li key={idx} className="plant-spec-item">
                <strong>{item.label}:</strong> {item.description}
              </li>
            ))}
          </ul>
        </details>
      );
    };

    const panels = [];

    // Light Requirements
    const lightItems = [];
    if (tags.includes('bright-indirect')) lightItems.push({ label: 'Bright Indirect', description: 'Thrives in bright, indirect light. Avoid direct afternoon sun.' });
    if (tags.includes('full-sun')) lightItems.push({ label: 'Full Sun', description: 'Requires at least 6 hours of direct sunlight per day.' });
    if (tags.includes('low-light')) lightItems.push({ label: 'Low Light', description: 'Tolerates low light; avoid deep shade but does not need direct sun.' });
    if (lightItems.length > 0) panels.push(createPanel('Light Requirements', lightItems));

    // Moisture & Humidity
    const moistureItems = [];
    if (tags.includes('high-humidity')) moistureItems.push({ label: 'High Humidity', description: 'Requires high humidity and consistent moisture; mist regularly or use a humid environment.' });
    if (tags.includes('drought-tolerant')) moistureItems.push({ label: 'Drought Tolerant', description: 'Allow soil to dry between waterings; avoid overwatering.' });
    if (moistureItems.length > 0) panels.push(createPanel('Moisture & Humidity', moistureItems));

    // Temperature & Hardiness
    const hardinessItems = [];
    if (productObj.zones && Array.isArray(productObj.zones) && productObj.zones.length > 0) {
      const zoneRange = productObj.zones.length > 1 ? `${productObj.zones[0]}–${productObj.zones[productObj.zones.length - 1]}` : productObj.zones[0];
      hardinessItems.push({ label: 'USDA Zones', description: `Hardy in zones ${zoneRange}.` });
    }
    if (tags.includes('protect-below-50')) hardinessItems.push({ label: 'Protect below 50°F', description: 'Move indoors or provide protection when temperatures dip below 50°F.' });
    if (hardinessItems.length > 0) panels.push(createPanel('Temperature & Hardiness', hardinessItems));

    // Pet Safety
    const petItems = [];
    if (tags.includes('pet-friendly')) petItems.push({ label: 'Pet Friendly', description: 'Non-toxic to cats and dogs.' });
    if (tags.includes('toxic-to-pets')) petItems.push({ label: 'Toxic to Pets', description: 'Contains compounds that may be harmful if ingested; keep out of reach of pets.' });
    if (petItems.length > 0) panels.push(createPanel('Pet Safety', petItems));

    // Plant Type & Habit
    const typeItems = [];
    if (tags.includes('aroid')) typeItems.push({ label: 'Aroid', description: 'Member of the Araceae family; tropical foliage plant often with climbing habit.' });
    if (tags.includes('bromeliad')) typeItems.push({ label: 'Bromeliad', description: 'Tropical plant in the Bromeliaceae family; many are epiphytic and appreciate bright, indirect light.' });
    if (tags.includes('cactus')) typeItems.push({ label: 'Cactus', description: 'Drought-tolerant succulent with spines; needs full sun and well-draining soil.' });
    if (tags.includes('succulent') && !tags.includes('cactus')) typeItems.push({ label: 'Succulent', description: 'Stores water in fleshy leaves or stems; prefers bright light and infrequent watering.' });
    if (tags.includes('epiphytic')) typeItems.push({ label: 'Epiphytic', description: 'Grows on other plants or surfaces without soil; absorbs moisture from the air.' });
    if (tags.includes('air-plant')) typeItems.push({ label: 'Air Plant', description: 'A type of epiphyte that grows without soil; appreciate bright, indirect light and good air circulation.' });
    if (tags.includes('tree')) typeItems.push({ label: 'Tree', description: 'Woody perennial plant; requires ample space and support.' });
    if (tags.includes('shrubs')) typeItems.push({ label: 'Shrub', description: 'Small to medium-sized woody plant; may produce flowers or berries.' });
    if (tags.includes('herb')) typeItems.push({ label: 'Herb', description: 'Plant used for culinary or medicinal purposes; often aromatic.' });
    if (tags.includes('fruit-tree')) typeItems.push({ label: 'Fruit Tree', description: 'Produces edible fruit; typically requires full sun and pollination.' });
    if (tags.includes('medicinal')) typeItems.push({ label: 'Medicinal', description: 'Known for traditional medicinal uses; parts of the plant may be used in herbal remedies.' });
    if (tags.includes('fern')) typeItems.push({ label: 'Fern', description: 'Non-flowering vascular plant with feathery fronds; thrives in high humidity and indirect light.' });
    if (tags.includes('orchid')) typeItems.push({ label: 'Orchid', description: 'Member of the Orchidaceae family; often epiphytic with exotic blooms requiring high humidity and bright, indirect light.' });
    if (tags.includes('tropical')) typeItems.push({ label: 'Tropical', description: 'Native to warm, humid regions; prefers temperatures above 60°F and high moisture.' });
    if (tags.includes('beginner-friendly')) typeItems.push({ label: 'Beginner Friendly', description: 'Easy to care for and forgiving of minor mistakes; suitable for novice gardeners.' });
    if (tags.includes('rare')) typeItems.push({ label: 'Collector Plant', description: 'Sought-after, hard-to-find plant prized by collectors.' });
    if (typeItems.length > 0) panels.push(createPanel('Plant Type & Habit', typeItems));

    // Special Features
    const featureItems = [];
    if (tags.includes('fragrant') || tags.includes('aromatic')) featureItems.push({ label: 'Fragrant', description: 'Produces aromatic flowers or foliage.' });
    if (tags.includes('root-crop')) featureItems.push({ label: 'Edible Root', description: 'Grown for its edible roots or tubers.' });
    if (tags.includes('medicinal') && !featureItems.some(it => it.label === 'Medicinal')) featureItems.push({ label: 'Medicinal', description: 'Used in herbal remedies or traditional medicine.' });
    if (tags.includes('climbing')) featureItems.push({ label: 'Climbing', description: 'Has a climbing habit; may need support or a trellis.' });
    if (tags.includes('drought-tolerant') && !moistureItems.some(it => it.label === 'Drought Tolerant')) featureItems.push({ label: 'Drought Tolerant', description: 'Allows soil to dry between waterings and thrives in dry conditions.' });
    if (featureItems.length > 0) panels.push(createPanel('Special Features', featureItems));

    return <div className="plant-specs">{panels}</div>;
  };

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const imageUrl = product.image ? (product.image.startsWith('http') ? product.image : `${typeof window !== 'undefined' ? window.location.origin : ''}${product.image.startsWith('/') ? product.image : '/' + product.image}`) : '';
  const descriptionText = product.description || `${product.name} live plant available for purchase.`;

  const structuredSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': descriptionText,
    'image': imageUrl,
    'sku': product.slug,
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'USD',
      'price': product.price,
      'availability': isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      'url': pageUrl,
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'name': 'Live Plant Guarantee',
        'returnPolicyCategory': 'MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 7,
        'returnMethod': 'InStoreOnly',
        'refundType': 'StoreCredit'
      },
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': 0,
          'currency': 'USD'
        },
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'US',
          'addressRegion': 'FL',
          'addressLocality': 'St. Petersburg'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 0,
            'maxValue': 2,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 0,
            'maxValue': 0,
            'unitCode': 'DAY'
          }
        },
        'deliveryMode': 'https://schema.org/DeliveryModePickUp'
      }
    },
    'brand': {
      '@type': 'Brand',
      'name': 'The Botanical Bazaar'
    }
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' }}>
      <Head>
        <title>{`${product.name} | The Botanical Bazaar`}</title>
        <meta name="description" content={descriptionText} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${product.name} | The Botanical Bazaar`} />
        <meta property="og:description" content={descriptionText} />
        <meta property="og:image" content={imageUrl} />
        <meta name="twitter:title" content={`${product.name} | The Botanical Bazaar`} />
        <meta name="twitter:description" content={descriptionText} />
        <meta name="twitter:image" content={imageUrl} />
        <script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </Head>

      <style jsx global>{`
        .product-main-container {
          max-width: 1000px;
          margin: 2.5rem auto;
          background: #123826;
          border-radius: 16px;
          box-shadow: 0 3px 14px rgba(20,40,30,0.12);
          padding: 2.5rem;
          color: #F5E7C4;
          display: flex;
          flex-direction: row;
          gap: 3rem;
          align-items: flex-start;
          font-family: 'Crimson Text', serif;
          box-sizing: border-box;
        }
        .product-img {
          flex: 1 1 40%;
          min-width: 280px;
          max-width: 450px;
          box-sizing: border-box;
        }
        .product-img img {
          width: 100%;
          border-radius: 14px;
          background: #e9dcbe11;
          object-fit: contain !important;
          display: block;
        }
        .product-info {
          flex: 2;
          text-align: left;
          box-sizing: border-box;
        }
        .product-info h1 {
          margin-top: 0;
          font-size: 2rem;
          color: #D4B06A;
          font-family: 'Cinzel', serif;
          line-height: 1.2;
        }
        .product-info p {
          margin: 0.5rem 0;
          font-size: 1.12rem;
          line-height: 1.5;
        }
        .product-info .price {
          color: #D4B06A;
          font-size: 1.6rem;
          font-weight: bold;
          margin: 0.7rem 0;
        }
        .product-info .product-tag-link {
          display: inline-block;
          background-color: #1C3D2E;
          color: #F5E7C4;
          border: 1px solid #749c7f;
          border-radius: 14px;
          padding: 0.15rem 0.55rem;
          margin: 0 0.2rem 0.4rem 0;
          font-size: 0.85rem;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
        }
        .product-info .product-tag-link:hover {
          background-color: #249160;
          color: #fffde6;
        }
        .back-link {
          color: #E9DCBE;
          text-decoration: underline;
          margin-bottom: 1.5rem;
          display: inline-block;
          font-size: 1rem;
        }

        /* Plant specifications collapsible panels styled strictly to match legacy */
        .plant-specs {
          margin-top: 1rem;
        }
        .plant-spec-detail {
          margin-top: 0.6rem;
          background: #123826;
          border-radius: 8px;
          padding: 0.4rem 0.8rem;
          color: #F5E7C4;
        }
        .plant-spec-summary {
          cursor: pointer;
          font-weight: bold;
          color: #D4B06A;
          outline: none;
        }
        .plant-spec-summary::-webkit-details-marker {
          display: none;
        }
        .plant-spec-detail[open] .plant-spec-summary {
          margin-bottom: 0.3rem;
        }
        .plant-spec-list {
          margin: 0 0 0.3rem 1rem;
          padding: 0;
          list-style: disc;
        }
        .plant-spec-item {
          margin: 0.2rem 0;
          font-size: 0.95rem;
        }

        @media (max-width: 800px) {
          .product-main-container {
            flex-direction: column;
            align-items: center;
            gap: 1.5rem;
            padding: 1.2rem 0.5rem;
          }
          .product-info {
            text-align: center;
          }
        }
      `}</style>

      <Link href="/shop" className="back-link">
        &larr; Back to Shop
      </Link>

      <main className="product-main-container">
        {/* Product Image */}
        <div className="product-img" style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', minWidth: '280px', maxWidth: '450px' }}>
          <Image
            src={product.image ? (product.image.startsWith('http') || product.image.startsWith('/') ? product.image : '/' + product.image) : '/assets/placeholder.png'}
            alt={product.name}
            fill
            sizes="(max-width: 800px) 100vw, 450px"
            className="product-detail-image"
            style={{ objectFit: 'contain', borderRadius: '14px', background: '#e9dcbe11' }}
            priority
            unoptimized={!product.image || !product.image.includes('cdn.sanity.io')}
          />
        </div>

        {/* Product Meta, Specifications, Actions */}
        <div className="product-info">
          <h1>{product.name}</h1>
          <p><strong>Size(s):</strong> {product.sizes || 'Standard Pot'}</p>
          <p><strong>Type:</strong> {product.type}</p>
          <p>
            {product.description || `This highly desired tropical plant species thrives beautifully in hardiness zones ${product.zones ? product.zones.join(', ') : '9, 10, 11'}. Perfect addition to any rare collectors garden.`}
          </p>

          <div className="price">
            {isSoldOut ? (
              <span style={{ color: '#ba2f2f', fontWeight: 'bold' }}>Sold Out</span>
            ) : (
              isNaN(product.price) || !product.price ? 'Price on Request' : `$${product.price.toFixed(2)}`
            )}
          </div>

          {/* Size dropdown selection */}
          {sizesArray.length > 0 && (
            <div style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#F5E7C4' }}>Select Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #D4B06A',
                  backgroundColor: '#1C3D2E',
                  color: '#F4F1E1',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              >
                {sizesArray.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}

          {/* Actions: Quantity Selector & Add to Cart */}
          {!isSoldOut && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #D4B06A', borderRadius: '24px', overflow: 'hidden', backgroundColor: '#1C3D2E' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}
                >
                  -
                </button>
                <span style={{ padding: '0 1rem', color: '#F4F1E1', fontWeight: 'bold' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer', outline: 'none' }}
                >
                  +
                </button>
              </div>

              <Button variant="gold-filled" onClick={handleAddToCart} style={{ flex: '1 1 auto', minWidth: '150px' }}>
                Add to Cart
              </Button>
            </div>
          )}

          {/* Sold out indicator if sold out */}
          {isSoldOut && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{
                background: '#ba2f2f',
                color: '#ffffff',
                padding: '0.8rem',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                marginBottom: '1rem'
              }}>
                Temporarily Sold Out
              </div>

              {/* Notify Me Form or Confirmation */}
              <div style={{
                background: '#1C3D2E',
                border: '1px solid #D4B06A',
                borderRadius: '8px',
                padding: '1.2rem',
                color: '#F5E7C4',
                textAlign: 'left',
                boxSizing: 'border-box'
              }}>
                {notifySubscribed ? (
                  <div style={{
                    color: '#D4B06A',
                    fontWeight: 'bold',
                    fontSize: '1.1rem',
                    textAlign: 'center',
                    fontFamily: "'Crimson Text', serif"
                  }}>
                    You're on the list! We'll email you the moment this specimen returns.
                  </div>
                ) : (
                  <form onSubmit={handleNotifyMe} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <label style={{ fontWeight: 'bold', fontSize: '1rem', color: '#D4B06A', fontFamily: "'Crimson Text', serif" }}>
                      Email me when available:
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <input
                        type="email"
                        placeholder="Your email address"
                        required
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        disabled={notifyLoading}
                        style={{
                          flex: '1 1 200px',
                          padding: '0.6rem 0.8rem',
                          borderRadius: '8px',
                          border: '1px solid rgba(212, 176, 106, 0.4)',
                          background: '#F5E7C4',
                          color: '#00301E',
                          fontFamily: 'inherit',
                          fontSize: '1rem',
                          outline: 'none',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="submit"
                        disabled={notifyLoading}
                        style={{
                          background: '#D4B06A',
                          color: '#00301E',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0.6rem 1.2rem',
                          fontFamily: 'inherit',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: notifyLoading ? 'not-allowed' : 'pointer',
                          flex: '0 0 auto',
                          transition: 'opacity 0.2s',
                          opacity: notifyLoading ? 0.7 : 1
                        }}
                      >
                        {notifyLoading ? 'Submitting...' : 'Notify Me'}
                      </button>
                    </div>
                    {notifyError && (
                      <p style={{ color: '#ba2f2f', margin: '0.4rem 0 0 0', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {notifyError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Secondary Actions: Wishlist and Back buttons */}
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
            <Button variant="outline" onClick={() => toggleWishlist(product)} style={{ flex: '1 1 auto' }}>
              {isWishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </Button>
            <Button variant="outline" href="/shop" style={{ flex: '1 1 auto' }}>
              Back to Shop
            </Button>
          </div>

          {/* Render linked tag list if present */}
          {product.tags && product.tags.length > 0 && (
            <div style={{ marginTop: '0.8rem', marginBottom: '1rem', textAlign: 'left' }}>
              <strong style={{ color: '#F5E7C4' }}>Tags: </strong>
              {product.tags.map(tag => {
                const label = tag.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
                return (
                  <Link key={tag} href={`/shop?search=${encodeURIComponent(tag)}`} className="product-tag-link">
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Collapsible Plant specifications details panels */}
          {renderSpecs(product)}

          {/* Policy notes (Local Pickup only and Live Plant Guarantee) */}
          <div className="policy-note" style={{ marginTop: '1.5rem', fontSize: '0.95rem', lineHeight: '1.45', color: '#d9cba9', textAlign: 'left', borderTop: '1px solid rgba(212,176,106,0.2)', paddingTop: '1.2rem' }}>
            <strong>Local Pickup Only:</strong> All purchases are available for pickup at our nursery in St.&nbsp;Petersburg, Florida. We do not ship at this time. <br />
            <strong>Live Plant Guarantee:</strong> Please inspect your plant at pickup. If any hidden issues arise within 7&nbsp;days, we'll exchange it or issue store credit. Beyond this window, returns are not accepted.
          </div>
        </div>
      </main>

      {/* Related Products Carousel */}
      {getRelatedProducts().length > 0 && (
        <section
          style={{
            marginTop: '4rem',
            padding: '0 1rem',
            width: '100%',
            boxSizing: 'border-box'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <h2 style={{
            color: '#D4B06A',
            fontFamily: "'Cinzel', serif",
            fontSize: '1.8rem',
            textAlign: 'center',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            marginBottom: '2rem'
          }}>
            You Might Also Like
          </h2>

          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            {/* Left Scroll Arrow */}
            <button
              onClick={handleScrollLeft}
              style={{
                position: 'absolute',
                left: '-20px',
                zIndex: 10,
                background: '#00301E',
                border: '2px solid #D4B06A',
                color: '#D4B06A',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                userSelect: 'none'
              }}
              aria-label="Scroll left"
            >
              ←
            </button>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              style={{
                display: 'flex',
                gap: '1.5rem',
                overflowX: 'auto',
                scrollBehavior: 'smooth',
                cursor: isDragging ? 'grabbing' : 'grab',
                padding: '1rem 0.5rem',
                width: '100%',
                boxSizing: 'border-box',
                WebkitOverflowScrolling: 'touch'
              }}
              className="hide-scrollbar"
            >
              {getRelatedProducts().map(prod => {
                const isProdSoldOut = !prod.quantity || prod.quantity < 3;
                const prodImg = prod.image ? (prod.image.startsWith('http') || prod.image.startsWith('/') ? prod.image : '/' + prod.image) : '/assets/placeholder.png';

                return (
                  <div
                    key={prod.slug}
                    style={{
                      flex: '0 0 240px',
                      backgroundColor: '#E9DCBE',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      boxSizing: 'border-box',
                      color: '#00301E',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
                      position: 'relative'
                    }}
                  >
                    {isProdSoldOut && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: '#ba2f2f',
                        color: '#ffffff',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 'bold',
                        zIndex: 5
                      }}>
                        Sold Out
                      </div>
                    )}

                    <Link href={`/product/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <div style={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '4 / 5',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        marginBottom: '0.8rem'
                      }}>
                        <Image
                          src={prodImg}
                          alt={prod.name}
                          fill
                          sizes="240px"
                          style={{ objectFit: 'cover' }}
                          unoptimized={!prod.image || !prod.image.includes('cdn.sanity.io')}
                        />
                      </div>
                      <strong style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '1.15rem',
                        fontFamily: "'Cinzel', serif",
                        lineHeight: '1.2',
                        minHeight: '2.8rem',
                        color: '#00301E'
                      }}>
                        {prod.name}
                      </strong>
                    </Link>

                    <div style={{ marginTop: '0.5rem' }}>
                      <p style={{ margin: '0.2rem 0', fontSize: '0.95rem', color: '#555' }}>
                        {prod.sizes || "Standard Pot"}
                      </p>
                      <div style={{
                        fontWeight: 'bold',
                        fontSize: '1.1rem',
                        color: isProdSoldOut ? '#ba2f2f' : '#11402a',
                        margin: '0.4rem 0'
                      }}>
                        {isProdSoldOut ? "Sold Out" : `$${prod.price ? prod.price.toFixed(2) : '0.00'}`}
                      </div>

                      <Button
                        variant={isProdSoldOut ? "outline" : "green-filled"}
                        href={`/product/${prod.slug}`}
                        style={{
                          width: '100%',
                          marginTop: '0.4rem',
                          fontSize: '0.9rem',
                          padding: '0.4rem 1rem',
                          borderRadius: '18px',
                          boxSizing: 'border-box'
                        }}
                      >
                        {isProdSoldOut ? "Sold Out" : "View Plant"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Scroll Arrow */}
            <button
              onClick={handleScrollRight}
              style={{
                position: 'absolute',
                right: '-20px',
                zIndex: 10,
                background: '#00301E',
                border: '2px solid #D4B06A',
                color: '#D4B06A',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                userSelect: 'none'
              }}
              aria-label="Scroll right"
            >
              →
            </button>
          </div>

        </section>
      )}
    </div>
  );
}

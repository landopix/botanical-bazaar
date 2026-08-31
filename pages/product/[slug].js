import { getResolvedPotSize, getResolvedPlantType } from "../../components/ProductCard";
import React, { useState, useEffect } from 'react';
import SEO from '../../components/SEO';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import ProductCard from '../../components/ProductCard';
import Button from '../../components/Button';
import ProductImageGallery from '../../components/ProductImageGallery';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductByHandle, getAllProductHandles, getAllProducts, parseProductTitle } from '../../lib/shopify';
import useBfcacheReset from '../../hooks/useBfcacheReset';

// Dynamic imports for below-the-fold non-critical components
const FulfillmentCard = dynamic(() => import('../../components/FulfillmentCard'));
const WhatYouWillReceiveCard = dynamic(() => import('../../components/WhatYouWillReceiveCard'));
const LiveArrivalGuarantee = dynamic(() => import('../../components/LiveArrivalGuarantee'));
const ZoneCompatibilityBadges = dynamic(() => import('../../components/ZoneCompatibilityBadges'));
const CareSpine = dynamic(() => import('../../components/CareSpine'));

export async function getStaticPaths() {
  try {
    const handles = await getAllProductHandles();
    const paths = (handles || []).map(handle => ({
      params: { slug: handle }
    }));
    return {
      paths,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
}

function getFirstAvailableVariant(product) {
  if (!product || !product.variants || !Array.isArray(product.variants) || product.variants.length === 0) return null;
  const available = product.variants.filter(
    v => v.availableForSale !== false && (v.quantityAvailable === undefined || v.quantityAvailable > 0)
  );
  if (available.length > 0) {
    return available.reduce((lowest, v) => {
      const vPrice = typeof v.price === "number" ? v.price : parseFloat(v.price || 0);
      const lowestPrice = typeof lowest.price === "number" ? lowest.price : parseFloat(lowest.price || 0);
      return vPrice < lowestPrice ? v : lowest;
    }, available[0]);
  }
  return product.variants[0];
}

const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function getStaticProps({ params }) {
  const slug = params?.slug;

  // Validate parameter: enforce strict lowercase kebab-case format
  if (!slug || typeof slug !== 'string' || !KEBAB_CASE_REGEX.test(slug)) {
    return {
      notFound: true,
      revalidate: 60
    };
  }

  try {
    const [product, allProducts] = await Promise.all([
      getProductByHandle(slug),
      getAllProducts()
    ]);

    if (!product) {
      return {
        notFound: true,
        revalidate: 60
      };
    }

    return {
      props: {
        initialProduct: product,
        allProducts: allProducts || []
      },
      revalidate: 60
    };
  } catch (error) {
    console.error(`Error fetching product handle ${slug}:`, error);
    // Re-throw upstream API exceptions so Next.js ISR preserves the last successfully generated cached page
    throw error;
  }
}

export default function ProductDetail({ initialProduct, allProducts = [] }) {
  const recommendedRef = React.useRef(null);
  const router = useRouter();

  const [product, setProduct] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(
    getFirstAvailableVariant(initialProduct)
  );
  const [selectedSize, setSelectedSize] = useState(
    getFirstAvailableVariant(initialProduct)?.title || ''
  );
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { toggleWishlist, wishlist = [] } = useWishlist() || {};

  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState('');

  useBfcacheReset(() => setNotifyLoading(false));

  // Hardiness zone sync state
  const [hardinessZone, setHardinessZone] = useState('10a');

  useEffect(() => {
    if (initialProduct) {
      setProduct(initialProduct);
      const defaultVariant = getFirstAvailableVariant(initialProduct);
      setSelectedVariant(defaultVariant);
      setSelectedSize(defaultVariant?.title || '');
    }
  }, [initialProduct]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedZone = localStorage.getItem("user_hardiness_zone");
      if (savedZone) {
        setHardinessZone(savedZone);
      }

      const handleZoneUpdated = () => {
        const updated = localStorage.getItem("user_hardiness_zone");
        if (updated) {
          setHardinessZone(updated);
        }
      };

      window.addEventListener("user_hardiness_zone_updated", handleZoneUpdated);
      return () => {
        window.removeEventListener("user_hardiness_zone_updated", handleZoneUpdated);
      };
    }
  }, []);

  const handleNotifyMe = async (e) => {
    e.preventDefault();
    if (!notifyEmail || !notifyEmail.trim() || !product) return;

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
          name: product.name,
          type: 'item_waitlist'
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

  if (router.isFallback) {
    return <div style={{ padding: '4rem', textAlign: 'center', color: '#D4B06A' }}>Loading plant details...</div>;
  }

  // Handle variant size changes
  const handleSizeChange = (sizeTitle) => {
    setSelectedSize(sizeTitle);
    const matchingVariant = product.variants?.find(v => v.title === sizeTitle);
    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  // Active price and sold-out status derived from selected variant or product overall
  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const isVariantAvailable = selectedVariant ? selectedVariant.availableForSale : product.availableForSale;
  const isSoldOut = !isVariantAvailable || (selectedVariant?.quantityAvailable !== undefined ? selectedVariant.quantityAvailable < 1 : (!product.quantity || product.quantity < 1));
  const isWishlisted = Array.isArray(wishlist) && wishlist.some(item => (item?.slug?.current || item?.slug) === product.slug);
  const variantsArray = (product.variants && product.variants.length > 0 ? product.variants : []).filter(
    v => v.availableForSale !== false && (v.quantityAvailable === undefined || v.quantityAvailable > 0)
  );

  // Related / Recommended Products derived from same category or tags
  const recommendedProducts = React.useMemo(() => {
    if (!product || !allProducts || allProducts.length === 0) return [];

    const currentSlug = product.slug;
    const currentCats = (product.categories || []).map(c => c.toLowerCase());
    const currentTags = (product.tags || []).map(t => t.toLowerCase());

    const scored = allProducts
      .filter(p => p.slug !== currentSlug && p.availableForSale !== false)
      .map(p => {
        let score = 0;
        const pCats = (p.categories || []).map(c => c.toLowerCase());
        const pTags = (p.tags || []).map(t => t.toLowerCase());

        pCats.forEach(c => {
          if (currentCats.includes(c)) score += 3;
        });

        pTags.forEach(t => {
          if (currentTags.includes(t)) score += 1;
        });

        return { product: p, score };
      });

    scored.sort((a, b) => b.score - a.score);
    const topScored = scored.map(s => s.product);

    // Fallback if less than 4 matches
    if (topScored.length < 4) {
      const remaining = allProducts.filter(p => p.slug !== currentSlug && !topScored.some(ts => ts.slug === p.slug));
      return [...topScored, ...remaining].slice(0, 8);
    }

    return topScored.slice(0, 8);
  }, [product, allProducts]);

    // Parse Title for Scientific Name
  const { commonName, scientificName } = parseProductTitle(product.name);

  // Dynamic Size and Type Text
  const currentSizeDisplay = getResolvedPotSize(product, selectedVariant);
  const currentTypeDisplay = getResolvedPlantType(product);

  const handleAddToCart = () => {
    const itemToAdd = {
      ...product,
      price: activePrice,
      variantId: selectedVariant?.id || null
    };
    addToCart(itemToAdd, quantity, selectedSize);
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

    if (panels.length === 0) return null;

    return (
      <div className="plant-specs-container">
        <h2 className="specs-heading">Plant Specifications &amp; Care Details</h2>
        <div className="plant-specs">{panels}</div>
      </div>
    );
  };

  const SITE_ORIGIN = 'https://thebotanicalbazaar.com';
  const cleanSlug = String(product.slug || '').split('?')[0];
  const pageUrl = `${SITE_ORIGIN}/product/${cleanSlug}`;
  const galleryImages = product.images && product.images.length > 0 ? product.images : [product.image || '/assets/placeholder.png'];
  const imageUrl = galleryImages[0]?.startsWith('http') ? galleryImages[0] : `${SITE_ORIGIN}${galleryImages[0]?.startsWith('/') ? galleryImages[0] : '/' + galleryImages[0]}`;
  const descriptionText = product.description || `${product.name} live plant available for purchase at The Botanical Bazaar.`;

  const activeSku = selectedVariant?.sku || product.sku || product.slug;

  const structuredSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': descriptionText,
    'image': imageUrl,
    'sku': activeSku,
    'category': product.type || 'Plants',
    'offers': {
      '@type': 'Offer',
      'priceCurrency': 'USD',
      'price': activePrice,
      'itemCondition': 'https://schema.org/NewCondition',
      'availability': isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      'url': pageUrl,
      'seller': {
        '@type': 'Organization',
        'name': 'The Botanical Bazaar',
        'url': SITE_ORIGIN
      },
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'returnPolicyCategory': 'https://schema.org/MerchantReturnNotPermitted'
      }
    },
    'brand': {
      '@type': 'Brand',
      'name': 'The Botanical Bazaar'
    }
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': SITE_ORIGIN
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Shop',
        'item': `${SITE_ORIGIN}/shop`
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': product.name,
        'item': pageUrl
      }
    ]
  };

  return (
    <div className="pdp-wrapper">
      <SEO
        title={`${product.name}`}
        description={descriptionText}
        image={imageUrl}
        url={pageUrl}
        type="product"
      >
        <link rel="preload" as="image" href={imageUrl} />
        <script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
        <script
          id="breadcrumb-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      </SEO>

      <Link href="/shop" className="back-link">
        &larr; Back to Shop
      </Link>

      {/* Main Hero Container */}
      <section className="product-hero-container">
        {/* Left Column: Image Gallery Carousel */}
        <div className="product-gallery-column">
          <ProductImageGallery images={galleryImages} alt={product.name} />
        </div>

        {/* Right Column: Key Meta & Actions */}
        <div className="product-info-column">
          <h1 className="product-common-name">{commonName}</h1>
          {scientificName && (
            <p className="product-scientific-name">{scientificName}</p>
          )}

          <div className="meta-line">
            <p><strong>Size:</strong> {currentSizeDisplay}</p>
            <p><strong>Type:</strong> {currentTypeDisplay}</p>
          </div>

          <div className="price">
            {isSoldOut ? (
              <span className="sold-out-price">Sold Out</span>
            ) : (
              isNaN(activePrice) || !activePrice ? 'Price on Request' : `$${activePrice.toFixed(2)}`
            )}
          </div>

          {/* Size / Variant dropdown selection */}
          {variantsArray.length > 0 && variantsArray.some(v => v.title && v.title !== 'Default Title') && (
            <div className="size-selector-container">
              <label className="selector-label">Select Size / Variant:</label>
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(e.target.value)}
                className="size-select"
              >
                {variantsArray.map(variant => (
                  <option key={variant.id || variant.title} value={variant.title}>
                    {variant.title} - ${variant.price?.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions: Quantity Selector & Add to Cart */}
          {!isSoldOut && (
            <div className="action-row">
              <div className="quantity-selector">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="qty-btn"
                  type="button"
                >
                  -
                </button>
                <span className="qty-val">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="qty-btn"
                  type="button"
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
            <div className="sold-out-section">
              <div className="sold-out-banner">
                Temporarily Sold Out
              </div>

              {/* Notify Me Form or Confirmation */}
              <div className="notify-card">
                {notifySubscribed ? (
                  <div className="notify-success" role="status" aria-live="polite">
                    You&apos;re on the list! We&apos;ll email you the moment this specimen returns.
                  </div>
                ) : (
                  <form onSubmit={handleNotifyMe} className="notify-form">
                    <label htmlFor="pdp-notify-email" className="notify-label">
                      Email me when available:
                    </label>
                    <div className="notify-input-group">
                      <input
                        id="pdp-notify-email"
                        type="email"
                        placeholder="Your email address"
                        required
                        aria-required="true"
                        aria-invalid={!!notifyError}
                        aria-describedby={notifyError ? "pdp-notify-error" : undefined}
                        value={notifyEmail}
                        onChange={(e) => setNotifyEmail(e.target.value)}
                        disabled={notifyLoading}
                        className="notify-input"
                      />
                      <button
                        type="submit"
                        disabled={notifyLoading}
                        className="notify-submit-btn"
                      >
                        {notifyLoading ? 'Submitting...' : 'Notify Me'}
                      </button>
                    </div>
                    {notifyError && (
                      <p id="pdp-notify-error" className="notify-error" role="alert">
                        {notifyError}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Secondary Actions: Wishlist and Back buttons */}
          <div className="secondary-action-row">
            <Button
              variant={isWishlisted ? "gold-filled" : "outline"}
              onClick={() => toggleWishlist && toggleWishlist(product)}
              style={{
                flex: '1 1 auto',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isWishlisted ? "#00301E" : "none"}
                stroke={isWishlisted ? "#00301E" : "#D4B06A"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {isWishlisted ? 'In Wishlist Sanctuary' : 'Add to Wishlist'}
            </Button>
            <Button variant="outline" href="/shop" style={{ flex: '1 1 auto' }}>
              Back to Shop
            </Button>
          </div>

          {/* Render linked tag list if present */}
          {product.tags && product.tags.length > 0 && (
            <div className="product-tags-container">
              <strong style={{ color: '#F5E7C4', marginRight: '0.4rem' }}>Tags:</strong>
              {product.tags.map(tag => {
                const label = tag.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
                return (
                  <Link key={tag} href={`/shop?tag=${encodeURIComponent(tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''))}`} rel="nofollow" className="product-tag-link">
                    {label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Cold Hardiness & Thermal Guidance Card */}
          {product.type === "Plant" && (
            <div className="cold-guidance-card">
              <h3 className="cold-card-title">
                Cold Hardiness &amp; Thermal Guidance
              </h3>

              {/* Climate Zone Indicator and Selector */}
              <div className="zone-indicator-row">
                <span className="zone-indicator-label">
                  My Climate Zone
                </span>
                <button
                  onClick={() => window.dispatchEvent(new Event("open_zone_modal"))}
                  className="zone-pill-btn"
                  aria-label="Select USDA climate hardiness zone"
                  type="button"
                >
                  Zone {hardinessZone} ▾
                </button>
              </div>

              {product.minTempInGround && (
                <div style={{ marginBottom: product.minTempInPot ? '0.8rem' : '0' }}>
                  <h3 className="cold-hardiness-subtitle">
                    In-Ground Hardiness ({product.minTempInGround})
                  </h3>
                  <p className="cold-hardiness-text">
                    In-Ground Soil: The thermal mass of the Earth buffers extreme cold and heat swings, maintaining stable, moderate root zone temperatures.
                  </p>
                </div>
              )}

              {product.minTempInPot && (
                <div>
                  <h3 className="cold-hardiness-subtitle">
                    In-Pot / Container Hardiness ({product.minTempInPot})
                  </h3>
                  <p className="cold-hardiness-text">
                    In Pots (Containers): Containers cool down and freeze much faster because cold air surrounds all sides, exposing root systems to chilling risks at higher ambient temperatures.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Two-Column Informational Details Grid */}
      <section className="product-details-grid">
        {/* Column 1 (Left): Description, Care Spine, What You Will Receive, Specs */}
        <div className="details-col details-col-left">
          <div className="description-card">
            <h2 className="section-card-title">Botanical Description</h2>
            <p className="description-text">
              {product.description || `This highly desired tropical plant species thrives beautifully in hardiness zones ${product.zones ? product.zones.join(', ') : '9, 10, 11'}. Perfect addition to any rare collectors garden.`}
            </p>
          </div>

          <CareSpine product={product} />

          <WhatYouWillReceiveCard product={product} selectedVariant={selectedVariant} />

          {renderSpecs(product)}
        </div>

        {/* Column 2 (Right): Zone Compatibility, Fulfillment, Guarantee, Policy Note */}
        <div className="details-col details-col-right">
          <ZoneCompatibilityBadges product={product} userZone={hardinessZone} />

          <FulfillmentCard product={product} />

          <LiveArrivalGuarantee />

          {/* Policy notes (Standard Shipping & Nursery Pickup) */}
          <div className="policy-note">
            <strong>Nationwide Shipping &amp; Local Nursery Pickup:</strong> Choose between Nationwide Shipping (shipped with care from St. Petersburg, FL with insulated boxing &amp; weather holds; USDA compliance applies for HI, CA, TX, AK) or Free Local Nursery Pickup ($0.00) at checkout. <br />
            <strong>100% Live Arrival Guarantee:</strong> Guaranteed health upon arrival or collection. Inspect within 48 hours for replacement or store credit. <Link href="/returns" style={{ color: '#D4B06A', textDecoration: 'underline' }}>View Full Policy &rarr;</Link>
          </div>
        </div>
      </section>

      {/* Recommended / Related Products Horizontal Slider */}
      {recommendedProducts.length > 0 && (
        <section className="recommended-section">
          <h2 className="recommended-title">Recommended</h2>
          <div className="recommended-carousel-wrapper">
            <button
              className="rec-nav-btn rec-nav-prev"
              onClick={() => {
                if (recommendedRef.current) {
                  recommendedRef.current.scrollBy({ left: -300, behavior: "smooth" });
                }
              }}
              aria-label="Scroll recommended products left"
              type="button"
            >
              ‹
            </button>
            <div className="recommended-slider" ref={recommendedRef}>
              {recommendedProducts.map((recProd) => (
                <div key={recProd.slug || recProd.id} className="recommended-card-wrapper">
                  <ProductCard product={recProd} />
                </div>
              ))}
            </div>
            <button
              className="rec-nav-btn rec-nav-next"
              onClick={() => {
                if (recommendedRef.current) {
                  recommendedRef.current.scrollBy({ left: 300, behavior: "smooth" });
                }
              }}
              aria-label="Scroll recommended products right"
              type="button"
            >
              ›
            </button>
          </div>
        </section>
      )}

      <style jsx global>{`
        .recommended-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(212, 176, 106, 0.3);
          position: relative;
        }
        .recommended-title {
          color: #D4B06A;
          font-family: "Cinzel", serif;
          font-size: 1.75rem;
          text-align: center;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .recommended-carousel-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .recommended-slider {
          display: flex;
          gap: 1.2rem;
          overflow-x: auto;
          padding: 0.5rem 0.2rem 1rem 0.2rem;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
          width: 100%;
        }
        .recommended-slider::-webkit-scrollbar {
          display: none;
        }
        .recommended-card-wrapper {
          flex: 0 0 calc(25% - 0.9rem);
          min-width: 220px;
          scroll-snap-align: start;
          box-sizing: border-box;
        }
        .rec-nav-btn {
          position: absolute;
          top: 45%;
          transform: translateY(-50%);
          background: #00301E;
          color: #D4B06A;
          border: 1.5px solid #D4B06A;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          font-weight: bold;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          transition: all 0.2s ease;
        }
        .rec-nav-btn:hover {
          background: #D4B06A;
          color: #00301E;
        }
        .rec-nav-prev {
          left: -18px;
        }
        .rec-nav-next {
          right: -18px;
        }
                .pdp-wrapper {
          padding: 2rem 1.5rem 4rem 1.5rem;
          max-width: 1100px;
          margin: 0 auto;
          box-sizing: border-box;
          font-family: 'Crimson Text', serif;
          color: #F5E7C4;
        }
        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          color: #00301E;
          background-color: #D4B06A;
          border: 1px solid #D4B06A;
          padding: 0.45rem 1.1rem;
          border-radius: 20px;
          font-family: 'Cinzel', serif;
          font-weight: 700;
          font-size: 0.9rem;
          text-decoration: none;
          margin-bottom: 1.5rem;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .back-link:hover {
          background-color: #E9DCBE;
          border-color: #E9DCBE;
          color: #00301E;
          transform: translateY(-1px);
        }

        /* Hero Container */
        .product-hero-container {
          background: #123826;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          padding: 2rem;
          margin-bottom: 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
          align-items: start;
          box-sizing: border-box;
          border: 1px solid rgba(212, 176, 106, 0.2);
        }
        .product-gallery-column {
          width: 100%;
        }
        .product-info-column {
          width: 100%;
          text-align: left;
        }
        .product-common-name {
          margin-top: 0;
          margin-bottom: 0.2rem;
          font-size: 2rem;
          color: #D4B06A;
          font-family: 'Cinzel', serif;
          line-height: 1.25;
        }
        .product-scientific-name {
          margin-top: 0;
          margin-bottom: 0.8rem;
          font-size: 1.1rem;
          font-style: italic;
          color: #D4B06A;
          font-family: 'Crimson Text', serif;
          letter-spacing: 0.02em;
        }
        .meta-line {
          display: flex;
          gap: 1.5rem;
          font-size: 1.05rem;
          margin-bottom: 0.8rem;
          color: #F5E7C4;
        }
        .meta-line p {
          margin: 0;
        }
        .product-info-column .price {
          color: #D4B06A;
          font-size: 1.75rem;
          font-weight: bold;
          margin: 0.6rem 0 1rem 0;
          font-family: 'Cinzel', serif;
        }
        .sold-out-price {
          color: #ba2f2f;
          font-weight: bold;
        }
        .size-selector-container {
          margin-bottom: 1.2rem;
        }
        .selector-label {
          font-weight: bold;
          display: block;
          margin-bottom: 0.4rem;
          color: #F5E7C4;
          font-size: 0.95rem;
        }
        .size-select {
          width: 100%;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          border: 2px solid #D4B06A;
          background-color: #1C3D2E;
          color: #F4F1E1;
          font-family: inherit;
          fontSize: 1rem;
          outline: none;
        }
        .action-row {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 1.2rem;
          flex-wrap: wrap;
        }
        .quantity-selector {
          display: flex;
          align-items: center;
          border: 2px solid #D4B06A;
          border-radius: 24px;
          overflow: hidden;
          background-color: #1C3D2E;
        }
        .qty-btn {
          background: none;
          border: none;
          color: #D4B06A;
          padding: 0.5rem 1rem;
          font-size: 1.2rem;
          cursor: pointer;
          outline: none;
        }
        .qty-val {
          padding: 0 1rem;
          color: #F4F1E1;
          font-weight: bold;
        }
        .secondary-action-row {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.2rem;
        }
        .product-tags-container {
          margin-top: 0.8rem;
          margin-bottom: 1rem;
        }
        .product-tag-link {
          display: inline-block;
          background-color: #1C3D2E;
          color: #F5E7C4;
          border: 1px solid #749c7f;
          border-radius: 14px;
          padding: 0.15rem 0.55rem;
          margin: 0 0.25rem 0.4rem 0;
          font-size: 0.85rem;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
        }
        .product-tag-link:hover {
          background-color: #249160;
          color: #fffde6;
        }

        /* Sold Out Notify Section */
        .sold-out-section {
          margin-bottom: 1.2rem;
        }
        .sold-out-banner {
          background: #ba2f2f;
          color: #ffffff;
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          font-weight: bold;
          font-size: 1.1rem;
          margin-bottom: 0.8rem;
          font-family: 'Cinzel', serif;
        }
        .notify-card {
          background: #1C3D2E;
          border: 1px solid #D4B06A;
          border-radius: 8px;
          padding: 1rem;
          color: #F5E7C4;
          box-sizing: border-box;
        }
        .notify-success {
          color: #D4B06A;
          font-weight: bold;
          font-size: 1rem;
          text-align: center;
        }
        .notify-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .notify-label {
          font-weight: bold;
          font-size: 0.95rem;
          color: #D4B06A;
        }
        .notify-input-group {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .notify-input {
          flex: 1 1 180px;
          padding: 0.55rem 0.8rem;
          border-radius: 8px;
          border: 1px solid rgba(212, 176, 106, 0.4);
          background: #F5E7C4 !important;
          color: #00301E !important;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: bold;
          outline: none;
          box-sizing: border-box;
        }
        .notify-input::placeholder {
          color: #00301E !important;
          opacity: 0.75;
          font-weight: normal;
        }
        .notify-submit-btn {
          background: #D4B06A;
          color: #00301E;
          border: none;
          border-radius: 8px;
          padding: 0.55rem 1rem;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: bold;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .notify-error {
          color: #ba2f2f;
          margin: 0.3rem 0 0 0;
          font-size: 0.85rem;
          font-weight: bold;
        }

        /* Cold Hardiness Card */
        .cold-guidance-card {
          background: #D4B06A;
          color: #00301E;
          border-radius: 10px;
          padding: 1.2rem;
          margin-top: 1.2rem;
          text-align: left;
          box-sizing: border-box;
        }
        .cold-card-title {
          font-family: 'Cinzel', serif;
          font-size: 1.15rem;
          margin: 0 0 0.8rem 0;
          color: #00301E;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(0, 48, 30, 0.25);
          padding-bottom: 0.4rem;
        }
        .zone-indicator-row {
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }
        .zone-indicator-label {
          color: #00301E;
          font-weight: bold;
          font-family: 'Cinzel', serif;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .zone-pill-btn {
          background: #00301E;
          color: #D4B06A;
          border: 1px solid #00301E;
          padding: 0.25rem 0.75rem;
          border-radius: 16px;
          font-weight: bold;
          font-size: 0.85rem;
          cursor: pointer;
        }
        .cold-hardiness-subtitle {
          font-family: 'Cinzel', serif;
          font-weight: bold;
          font-size: 0.95rem;
          margin: 0 0 0.2rem 0;
          color: #00301E;
        }
        .cold-hardiness-text {
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #00301E;
        }

        /* Two-Column Details Grid */
        .product-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          align-items: start;
        }
        .details-col {
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .description-card {
          background: #123826;
          border: 1px solid #D4B06A;
          border-radius: 10px;
          padding: 1.25rem;
          margin-bottom: 1rem;
          color: #F5E7C4;
        }
        .section-card-title {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.15rem;
          margin: 0 0 0.8rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 0.4rem;
        }
        .description-text {
          margin: 0;
          font-size: 1.05rem;
          line-height: 1.55;
          color: #F5E7C4;
        }

        .plant-specs-container {
          background: #123826;
          border: 1px solid #D4B06A;
          border-radius: 10px;
          padding: 1.25rem;
          margin-top: 1rem;
        }
        .specs-heading {
          font-family: 'Cinzel', serif;
          color: #D4B06A;
          font-size: 1.15rem;
          margin: 0 0 0.8rem 0;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid rgba(212, 176, 106, 0.25);
          padding-bottom: 0.4rem;
        }
        .plant-specs {
          margin-top: 0.5rem;
        }
        .plant-spec-detail {
          margin-top: 0.6rem;
          background: #1C3D2E;
          border-radius: 8px;
          padding: 0.5rem 0.8rem;
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

        .policy-note {
          margin-top: 1rem;
          font-size: 0.95rem;
          line-height: 1.45;
          color: #d9cba9;
          text-align: left;
          background: rgba(0, 48, 30, 0.5);
          border: 1px solid rgba(212,176,106,0.3);
          border-radius: 10px;
          padding: 1rem;
        }

        @media (max-width: 900px) {
          .product-hero-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
            padding: 1.5rem 1rem;
          }
          .product-details-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
}

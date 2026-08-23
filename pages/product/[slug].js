import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import ProductImageGallery from '../../components/ProductImageGallery';
import FulfillmentCard from '../../components/FulfillmentCard';
import WhatYouWillReceiveCard from '../../components/WhatYouWillReceiveCard';
import LiveArrivalGuarantee from '../../components/LiveArrivalGuarantee';
import ZoneCompatibilityBadges from '../../components/ZoneCompatibilityBadges';
import CareSpine from '../../components/CareSpine';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductByHandle, getAllProductHandles, parseProductTitle } from '../../lib/shopify';
import useBfcacheReset from '../../hooks/useBfcacheReset';

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

export async function getStaticProps({ params }) {
  try {
    const product = await getProductByHandle(params.slug);
    if (!product) {
      return {
        notFound: true,
        revalidate: 60
      };
    }
    return {
      props: {
        initialProduct: product
      },
      revalidate: 60
    };
  } catch (error) {
    console.error(`Error fetching product handle ${params.slug}:`, error);
    return {
      notFound: true,
      revalidate: 60
    };
  }
}

export default function ProductDetail({ initialProduct }) {
  const router = useRouter();

  const [product, setProduct] = useState(initialProduct);
  const [selectedVariant, setSelectedVariant] = useState(
    initialProduct?.variants?.[0] || null
  );
  const [selectedSize, setSelectedSize] = useState(
    initialProduct?.variants?.[0]?.title || ''
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
      const defaultVariant = initialProduct.variants?.[0] || null;
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

  // Dynamic redirect for non-existent product pages straight back to /shop
  useEffect(() => {
    if (!product && !router.isFallback) {
      router.replace('/shop');
    }
  }, [product, router]);

  if (router.isFallback) {
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
  const isSoldOut = !isVariantAvailable || !product.quantity || product.quantity < 3;
  const isWishlisted = Array.isArray(wishlist) && wishlist.some(item => (item?.slug?.current || item?.slug) === product.slug);
  const variantsArray = product.variants && product.variants.length > 0 ? product.variants : [];

  // Parse Title for Scientific Name
  const { commonName, scientificName } = parseProductTitle(product.name);

  // Dynamic Size Text
  const currentSizeDisplay = selectedVariant && selectedVariant.title && selectedVariant.title !== 'Default Title'
    ? selectedVariant.title
    : (product.sizes || 'Standard Pot');

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
        <h3 className="specs-heading">Plant Specifications &amp; Care Details</h3>
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

  const structuredSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'description': descriptionText,
    'image': imageUrl,
    'sku': product.slug,
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
        'name': 'Live Plant Guarantee',
        'returnPolicyCategory': 'MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 2,
        'returnMethod': 'https://schema.org/ReturnNotPermitted',
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
          'addressCountry': 'US'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': 1,
            'maxValue': 3,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 2,
            'maxValue': 5,
            'unitCode': 'DAY'
          }
        }
      }
    },
    'brand': {
      '@type': 'Brand',
      'name': 'The Botanical Bazaar'
    }
  };

  return (
    <div className="pdp-wrapper">
      <Head>
        <title>{`${product.name} | The Botanical Bazaar`}</title>
        <meta name="description" content={descriptionText} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={`${product.name} | The Botanical Bazaar`} />
        <meta property="og:description" content={descriptionText} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${product.name} | The Botanical Bazaar`} />
        <meta name="twitter:description" content={descriptionText} />
        <meta name="twitter:image" content={imageUrl} />
        <script
          id="product-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredSchema) }}
        />
      </Head>

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
            <p><strong>Type:</strong> {product.type}</p>
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
                  <Link key={tag} href={`/shop?search=${encodeURIComponent(tag)}`} className="product-tag-link">
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
                  <h4 className="cold-hardiness-subtitle">
                    In-Ground Hardiness ({product.minTempInGround})
                  </h4>
                  <p className="cold-hardiness-text">
                    In-Ground Soil: The thermal mass of the Earth buffers extreme cold and heat swings, maintaining stable, moderate root zone temperatures.
                  </p>
                </div>
              )}

              {product.minTempInPot && (
                <div>
                  <h4 className="cold-hardiness-subtitle">
                    In-Pot / Container Hardiness ({product.minTempInPot})
                  </h4>
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
            <h3 className="section-card-title">Botanical Description</h3>
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
            <strong>100% Live Arrival Guarantee:</strong> Guaranteed health upon arrival or collection. Inspect within 48 hours for replacement or store credit. <a href="/returns" style={{ color: '#D4B06A', textDecoration: 'underline' }}>View Full Policy &rarr;</a>
          </div>
        </div>
      </section>

      <style jsx global>{`
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
          background: #D4B06A;
          color: #00301E;
          font-family: inherit;
          font-size: 0.95rem;
          outline: none;
          box-sizing: border-box;
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

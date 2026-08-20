import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Button from '../../components/Button';
import FulfillmentCard from '../../components/FulfillmentCard';
import WhatYouWillReceiveCard from '../../components/WhatYouWillReceiveCard';
import LiveArrivalGuarantee from '../../components/LiveArrivalGuarantee';
import ZoneCompatibilityBadges from '../../components/ZoneCompatibilityBadges';
import CareSpine from '../../components/CareSpine';
import OwnerBenchNotes from '../../components/OwnerBenchNotes';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { getProductByHandle, getAllProductHandles } from '../../lib/shopify';
import { isSanityCdnUrl } from '../../lib/image-utils';

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
  const { toggleWishlist, wishlist } = useWishlist();

  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySubscribed, setNotifySubscribed] = useState(false);
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState('');

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
  const isWishlisted = wishlist.some(item => item.slug === product.slug);
  const variantsArray = product.variants && product.variants.length > 0 ? product.variants : [];

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
      'price': activePrice,
      'availability': isSoldOut ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      'url': pageUrl,
      'hasMerchantReturnPolicy': {
        '@type': 'MerchantReturnPolicy',
        'name': 'Live Plant Guarantee',
        'returnPolicyCategory': 'MerchantReturnFiniteReturnWindow',
        'merchantReturnDays': 2,
        'returnMethod': 'https://schema.org/ReturnByMail',
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

  const productImage = product.image ? (product.image.startsWith("http") || product.image.startsWith("/") ? product.image : "/" + product.image) : "/assets/placeholder.png";

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
          max-width: 820px;
          margin: 2.5rem auto;
          background: #123826;
          border-radius: 16px;
          box-shadow: 0 3px 14px rgba(20,40,30,0.12);
          padding: 2rem 1.5rem;
          color: #F5E7C4;
          display: flex;
          flex-direction: row;
          gap: 2rem;
          align-items: flex-start;
          font-family: 'Crimson Text', serif;
          box-sizing: border-box;
        }
        .product-img {
          flex: 1;
          min-width: 220px;
          max-width: 280px;
          box-sizing: border-box;
        }
        .product-img img {
          width: 100%;
          border-radius: 14px;
          background: #e9dcbe11;
          object-fit: cover;
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
            padding: 1.5rem 1rem;
            margin: 1rem auto;
          }
          .product-img {
            max-width: 320px !important;
            width: 100% !important;
            height: 280px !important;
          }
          .product-info {
            text-align: center;
            width: 100%;
          }
        }
      `}</style>

      <Link href="/shop" className="back-link">
        &larr; Back to Shop
      </Link>

      <main className="product-main-container">
        {/* Product Image */}
        <div className="product-img" style={{ position: 'relative', width: '100%', height: '280px', minWidth: '220px', maxWidth: '280px' }}>
          <Image
            src={productImage}
            alt={product.name}
            fill
            sizes="(max-width: 800px) 100vw, 280px"
            style={{ objectFit: 'cover', borderRadius: '14px', background: '#e9dcbe11' }}
            priority
            unoptimized={!isSanityCdnUrl(productImage)}
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
              isNaN(activePrice) || !activePrice ? 'Price on Request' : `$${activePrice.toFixed(2)}`
            )}
          </div>

          {/* Size / Variant dropdown selection */}
          {variantsArray.length > 0 && variantsArray.some(v => v.title && v.title !== 'Default Title') && (
            <div style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', color: '#F5E7C4' }}>Select Size:</label>
              <select
                value={selectedSize}
                onChange={(e) => handleSizeChange(e.target.value)}
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
                    You&apos;re on the list! We&apos;ll email you the moment this specimen returns.
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
                          background: '#D4B06A',
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
              {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
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

          {/* Care Spine Quick Guide */}
          <CareSpine product={product} />

          {/* Owner Bench Notes */}
          <OwnerBenchNotes notes={product.ownerNotes} />

          {/* USDA Zone Compatibility Badges & Microclimate Tip */}
          <ZoneCompatibilityBadges product={product} userZone={hardinessZone} />

          {/* Unified Fulfillment & Ag Restrictions Card */}
          <FulfillmentCard product={product} />

          {/* What You Will Receive Card */}
          <WhatYouWillReceiveCard product={product} />

          {/* Live-Arrival & Establishment Guarantee Card */}
          <LiveArrivalGuarantee />

          {/* Collapsible Plant specifications details panels */}
          {renderSpecs(product)}

          {/* Cold Hardiness & Thermal Guidance Card */}
          {product.type === "Plant" && (
            <div style={{
              background: '#D4B06A',
              color: '#00301E',
              borderRadius: '8px',
              padding: '1.25rem',
              marginTop: '1.5rem',
              textAlign: 'left',
              fontFamily: "'Crimson Text', serif",
              boxSizing: 'border-box'
            }}>
              <h3 style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '1.25rem',
                margin: '0 0 1rem 0',
                color: '#00301E',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid rgba(0, 48, 30, 0.25)',
                paddingBottom: '0.5rem'
              }}>
                Cold Hardiness &amp; Thermal Guidance
              </h3>

              {/* Climate Zone Indicator and Selector */}
              <div style={{
                marginBottom: '1.2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem'
              }}>
                <span style={{ color: '#00301E', fontWeight: 'bold', fontFamily: "'Cinzel', serif", fontSize: '0.85rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  My Climate Zone
                </span>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <button
                    onClick={() => window.dispatchEvent(new Event("open_zone_modal"))}
                    className="zone-pill-btn"
                    aria-label="Select USDA climate hardiness zone"
                  >
                    Zone {hardinessZone} ▾
                  </button>
                </div>
              </div>

              {product.minTempInGround && (
                <div style={{ marginBottom: product.minTempInPot ? '1.1rem' : '0' }}>
                  <h4 style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    margin: '0 0 0.3rem 0',
                    color: '#00301E'
                  }}>
                    In-Ground Hardiness ({product.minTempInGround})
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    color: '#00301E'
                  }}>
                    In-Ground Soil: The thermal mass of the Earth buffers extreme cold and heat swings, maintaining stable, moderate root zone temperatures.
                  </p>
                </div>
              )}

              {product.minTempInPot && (
                <div>
                  <h4 style={{
                    fontFamily: "'Cinzel', serif",
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    margin: '0 0 0.3rem 0',
                    color: '#00301E'
                  }}>
                    In-Pot / Container Hardiness ({product.minTempInPot})
                  </h4>
                  <p style={{
                    margin: 0,
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    color: '#00301E'
                  }}>
                    In Pots (Containers): Containers cool down and freeze much faster because cold air surrounds all sides, exposing root systems to chilling risks at higher ambient temperatures.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Policy notes (Standard Shipping & Nursery Pickup) */}
          <div className="policy-note" style={{ marginTop: '1.5rem', fontSize: '0.95rem', lineHeight: '1.45', color: '#d9cba9', textAlign: 'left', borderTop: '1px solid rgba(212,176,106,0.2)', paddingTop: '1.2rem' }}>
            <strong>Standard Shipping &amp; Local Nursery Pickup:</strong> Choose between Standard Shipping (shipped with care from St. Petersburg, FL with insulated boxing &amp; weather holds) or Local Nursery Pickup ($0.00 / Free) at checkout. <br />
            <strong>Live Plant Guarantee:</strong> Guaranteed health upon arrival or collection. Please inspect within 48 hours for claim submission or exchange. <a href="/returns" style={{ color: '#D4B06A', textDecoration: 'underline' }}>View Full Policy &rarr;</a>
          </div>
        </div>
      </main>
    </div>
  );
}

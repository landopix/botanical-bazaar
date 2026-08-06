import React, { useState, useEffect } from 'react';
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

  const sizesArray = product.sizes ? product.sizes.split('|').map(s => s.trim()) : [];
  const isSoldOut = !product.quantity || product.quantity <= 0;
  const isWishlisted = wishlist.some(item => item.slug === product.slug);

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize);
    router.push('/cart');
  };

  return (
    <div style={{ padding: '3rem 1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
        {/* Product Image */}
        <div style={{ flex: '1 1 400px' }}>
          <img
            src={product.image}
            alt={product.name}
            onError={(e) => { e.target.src = '/assets/placeholder.png'; }}
            style={{ width: '100%', borderRadius: '12px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}
          />
        </div>

        {/* Product Meta & Actions */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{
              background: '#D4B06A',
              color: '#1C3D2E',
              padding: '0.3rem 0.8rem',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              textTransform: 'uppercase'
            }}>
              {product.type}
            </span>
            <h1 style={{ color: '#D4B06A', margin: '0.5rem 0 0 0', fontFamily: 'Georgia, serif', fontSize: '2.5rem' }}>
              {product.name}
            </h1>
          </div>

          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#F4F1E1' }}>
            {isNaN(product.price) || !product.price ? 'Price on Request' : `$${product.price.toFixed(2)}`}
          </div>

          <div>
            <p style={{ lineHeight: '1.6', fontSize: '1.1rem' }}>
              {product.description || `This highly desired tropical plant species thrives beautifully in hardiness zones ${product.zones ? product.zones.join(', ') : '9, 10, 11'}. Perfect addition to any rare collectors garden.`}
            </p>
          </div>

          {/* USDA Zones / Info */}
          <div style={{ borderTop: '1px solid #1C3D2E', borderBottom: '1px solid #1C3D2E', padding: '1rem 0', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <strong>USDA Zone Compatibility:</strong>
              <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                {product.zones && product.zones.map(z => (
                  <span key={z} style={{ background: '#1C3D2E', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>Zone {z}</span>
                ))}
              </div>
            </div>
            {product.tags && product.tags.length > 0 && (
              <div>
                <strong>Tags:</strong>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                  {product.tags.map(t => (
                    <span key={t} style={{ background: '#123826', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.85rem' }}>{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Size Select */}
          {sizesArray.length > 0 && (
            <div>
              <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>Select Size:</label>
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
                  fontSize: '1rem'
                }}
              >
                {sizesArray.map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}

          {/* Quantity and Actions */}
          {!isSoldOut && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #D4B06A', borderRadius: '24px', overflow: 'hidden' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  -
                </button>
                <span style={{ padding: '0 1rem', color: '#F4F1E1', fontWeight: 'bold' }}>{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{ background: 'none', border: 'none', color: '#D4B06A', padding: '0.5rem 1rem', fontSize: '1.2rem', cursor: 'pointer' }}
                >
                  +
                </button>
              </div>

              <Button variant="gold-filled" onClick={handleAddToCart} style={{ flex: 1 }}>
                Add to Cart
              </Button>
            </div>
          )}

          {/* Sold Out Badge */}
          {isSoldOut && (
            <div style={{
              background: '#ba2f2f',
              color: '#ffffff',
              padding: '0.8rem',
              borderRadius: '8px',
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              Temporarily Sold Out
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline" onClick={() => toggleWishlist(product)} style={{ flex: 1 }}>
              {isWishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}
            </Button>
            <Button variant="outline" href="/shop" style={{ flex: 1 }}>
              Back to Shop
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

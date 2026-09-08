import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';

const WishlistContext = createContext();

export function normalizeWishlistItem(product) {
  if (!product) return null;

  const rawSlug = product.slug?.current || product.slug || '';
  const rawName = product.name || product.title || 'Botanical Specimen';
  const rawPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0;

  let rawImage = product.image || product.imageUrl || product.featuredImage?.url;
  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    rawImage = typeof firstImg === 'string' ? firstImg : (firstImg?.url || firstImg?.src || rawImage);
  }
  const image = rawImage
    ? (rawImage.startsWith('http') || rawImage.startsWith('/') ? rawImage : '/' + rawImage)
    : '/assets/placeholder.png';

  const quantity = product.quantity ?? 10;
  const availableForSale = product.availableForSale !== false && quantity >= 3;

  return {
    ...product,
    id: product.id || rawSlug,
    slug: rawSlug,
    name: rawName,
    title: rawName,
    price: rawPrice,
    image,
    imageUrl: image,
    sizes: product.sizes || product.potSize || product.custom?.pot_size || 'Standard Pot',
    type: product.type || product.category || 'Tropical Plant',
    availableForSale,
    quantity,
    variantId: product.variantId || product.variants?.[0]?.id || null
  };
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const storedWishlist = localStorage.getItem('botanical_wishlist');
    if (storedWishlist) {
      try {
        const parsed = JSON.parse(storedWishlist);
        if (Array.isArray(parsed)) {
          setWishlist(parsed.map(normalizeWishlistItem).filter(Boolean));
        }
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message, actionLabel = null, actionHref = null) => {
    setToast({ id: Date.now(), message, actionLabel, actionHref });
  };

  const saveWishlist = (newWishlist) => {
    const normalized = newWishlist.map(normalizeWishlistItem).filter(Boolean);
    setWishlist(normalized);
    localStorage.setItem('botanical_wishlist', JSON.stringify(normalized));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlist_updated'));
    }
  };

  const addToWishlist = (product) => {
    const normalized = normalizeWishlistItem(product);
    if (!normalized || !normalized.slug) return;
    if (!wishlist.some((item) => item.slug === normalized.slug)) {
      saveWishlist([...wishlist, normalized]);
      showToast(`Added "${normalized.name}" to Wishlist Sanctuary`, 'View Sanctuary', '/wishlist');
    }
  };

  const removeFromWishlist = (target) => {
    const targetSlug = typeof target === 'object' ? (target.slug?.current || target.slug) : target;
    const existingItem = wishlist.find((item) => item.slug === targetSlug);
    const itemName = existingItem?.name || (typeof target === 'object' ? target.name : null) || 'Specimen';

    saveWishlist(wishlist.filter((item) => item.slug !== targetSlug));
    showToast(`Removed "${itemName}" from Wishlist Sanctuary`);
  };

  const toggleWishlist = (product) => {
    const normalized = normalizeWishlistItem(product);
    if (!normalized || !normalized.slug) return;

    if (wishlist.some((item) => item.slug === normalized.slug)) {
      removeFromWishlist(normalized);
    } else {
      addToWishlist(normalized);
    }
  };

  const clearWishlist = () => {
    saveWishlist([]);
    showToast('Cleared Wishlist Sanctuary');
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        clearWishlist,
        normalizeWishlistItem
      }}
    >
      {children}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="wishlist-toast"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
            background: '#00301E',
            color: '#F5E7C4',
            border: '1px solid #D4B06A',
            borderRadius: '24px',
            padding: '0.6rem 1.2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
            fontSize: '0.95rem',
            fontFamily: "'Crimson Text', serif",
            animation: 'toastSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <span style={{ color: '#D4B06A', fontSize: '1.1rem' }}>♥</span>
          <span>{toast.message}</span>
          {toast.actionHref && toast.actionLabel && (
            <Link
              href={toast.actionHref}
              onClick={() => setToast(null)}
              style={{
                color: '#00301E',
                background: '#D4B06A',
                padding: '0.2rem 0.75rem',
                borderRadius: '12px',
                fontWeight: 'bold',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontFamily: "'Cinzel', serif",
                whiteSpace: 'nowrap'
              }}
            >
              {toast.actionLabel}
            </Link>
          )}
          <button
            onClick={() => setToast(null)}
            aria-label="Close notification"
            style={{
              background: 'none',
              border: 'none',
              color: '#D4B06A',
              fontSize: '1rem',
              cursor: 'pointer',
              padding: '0 0.2rem',
              lineHeight: 1
            }}
          >
            ✕
          </button>
          <style jsx>{`
            @keyframes toastSlideUp {
              from {
                opacity: 0;
                transform: translate(-50%, 16px);
              }
              to {
                opacity: 1;
                transform: translate(-50%, 0);
              }
            }
          `}</style>
        </div>
      )}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

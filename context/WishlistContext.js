import React, { createContext, useContext, useState, useEffect } from 'react';

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
    }
  };

  const removeFromWishlist = (slug) => {
    const targetSlug = typeof slug === 'object' ? (slug.slug?.current || slug.slug) : slug;
    saveWishlist(wishlist.filter((item) => item.slug !== targetSlug));
  };

  const toggleWishlist = (product) => {
    const normalized = normalizeWishlistItem(product);
    if (!normalized || !normalized.slug) return;

    if (wishlist.some((item) => item.slug === normalized.slug)) {
      removeFromWishlist(normalized.slug);
    } else {
      addToWishlist(normalized);
    }
  };

  const clearWishlist = () => {
    saveWishlist([]);
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
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

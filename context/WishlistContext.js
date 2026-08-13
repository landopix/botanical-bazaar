import React, { createContext, useContext, useState, useEffect } from 'react';

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const storedWishlist = localStorage.getItem('botanical_wishlist');
    if (storedWishlist) {
      try {
        setWishlist(JSON.parse(storedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist', e);
      }
    }
  }, []);

  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    localStorage.setItem('botanical_wishlist', JSON.stringify(newWishlist));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('wishlist_updated'));
    }
  };

  const addToWishlist = (product) => {
    if (!wishlist.some((item) => item.slug === product.slug)) {
      saveWishlist([...wishlist, product]);
    }
  };

  const removeFromWishlist = (slug) => {
    saveWishlist(wishlist.filter((item) => item.slug !== slug));
  };

  const toggleWishlist = (product) => {
    if (wishlist.some((item) => item.slug === product.slug)) {
      removeFromWishlist(product.slug);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}

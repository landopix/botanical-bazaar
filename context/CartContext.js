import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [fulfillmentMethod, setFulfillmentMethodState] = useState('shipping');

  useEffect(() => {
    const storedCart = localStorage.getItem('botanical_cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (e) {
        console.error('Failed to parse cart', e);
      }
    }

    const storedFulfillment = localStorage.getItem('botanical_fulfillmentMethod');
    if (storedFulfillment && (storedFulfillment === 'shipping' || storedFulfillment === 'pickup')) {
      setFulfillmentMethodState(storedFulfillment);
    }
  }, []);

  const saveCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem('botanical_cart', JSON.stringify(newCart));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('cart_updated'));
    }
  };

  const setFulfillmentMethod = (method) => {
    if (method === 'shipping' || method === 'pickup') {
      setFulfillmentMethodState(method);
      localStorage.setItem('botanical_fulfillmentMethod', method);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('fulfillment_updated', { detail: method }));
      }
    }
  };

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    const existingIndex = cart.findIndex(
      (item) => item.slug === product.slug && item.selectedSize === selectedSize
    );
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += quantity;
      saveCart(newCart);
    } else {
      saveCart([...cart, { ...product, quantity, selectedSize: selectedSize || (product.sizes ? product.sizes.split('|')[0].trim() : '') }]);
    }
  };

  const removeFromCart = (slug, selectedSize) => {
    const newCart = cart.filter((item) => !(item.slug === slug && item.selectedSize === selectedSize));
    saveCart(newCart);
  };

  const updateQuantity = (slug, selectedSize, quantity) => {
    if (quantity <= 0) {
      removeFromCart(slug, selectedSize);
      return;
    }
    const newCart = cart.map((item) => {
      if (item.slug === slug && item.selectedSize === selectedSize) {
        return { ...item, quantity };
      }
      return item;
    });
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        fulfillmentMethod,
        setFulfillmentMethod
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}

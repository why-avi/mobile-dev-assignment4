//CartContext.js
// Provides cartCount + cartItems globally so every screen stays in sync.

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCartCount, getCartItems } from './database';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);

  const refreshCart = useCallback(async () => {
    try {
      const [count, items] = await Promise.all([getCartCount(), getCartItems()]);
      setCartCount(count ?? 0);
      setCartItems(items ?? []);
    } catch (err) {
      console.warn('[CartContext] refreshCart error:', err);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider value={{ cartCount, cartItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}

import React, { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { UiProduct } from '../types/perfume';

interface WishlistContextType {
  items: UiProduct[];
  itemIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: UiProduct) => void;
}

const STORAGE_KEY = 'gray-collection-wishlist';
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<UiProduct[]>(() => {
    if (typeof window === 'undefined') {
      return [];
    }
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return [];
    }
    try {
      return JSON.parse(saved) as UiProduct[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const isWishlisted = (productId: string) => itemIds.includes(productId);

  const toggleWishlist = (product: UiProduct) => {
    setItems((prev) => (prev.some((item) => item.id === product.id) ? prev.filter((item) => item.id !== product.id) : [product, ...prev]));
  };

  return <WishlistContext.Provider value={{ items, itemIds, isWishlisted, toggleWishlist }}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

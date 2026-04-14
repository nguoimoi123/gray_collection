import React from 'react';
import { Heart, Search, ShoppingBag, User } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

function navClass(isActive: boolean) {
  return `pb-1 text-xs font-medium uppercase tracking-[0.25em] transition-colors ${
    isActive ? 'border-b-2 border-mint-400 text-brand-dark' : 'text-brand-gray hover:text-brand-dark'
  }`;
}

export function Header() {
  const { cartCount } = useCart();
  const { items } = useWishlist();
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[5.5rem] max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center">
          <img src="/image.png" alt="Gray Collection" className="h-20 object-contain" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <NavLink to="/collection" className={({ isActive }) => navClass(isActive)}>
            Mùi Hương
          </NavLink>
          <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
            Bộ Sưu Tập
          </NavLink>
          <NavLink to="/gift-set" className={({ isActive }) => navClass(isActive)}>
            Gift Set
          </NavLink>
          <NavLink to="/archive" className={({ isActive }) => navClass(isActive)}>
            Lưu Trữ
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => navClass(isActive)}>
            Giới Thiệu
          </NavLink>
        </nav>

        <div className="flex items-center gap-6">
          <Link to="/collection" className="text-brand-dark transition-colors hover:text-sage-600">
            <Search size={20} strokeWidth={1.5} />
          </Link>
          <Link to="/wishlist" className="relative text-brand-dark transition-colors hover:text-sage-600" title="Đã lưu">
            <Heart size={20} strokeWidth={1.5} />
            {items.length > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {items.length}
              </span>
            )}
          </Link>
          <Link to={isAuthenticated ? '/profile' : '/login'} className="text-brand-dark transition-colors hover:text-sage-600">
            <User size={20} strokeWidth={1.5} />
          </Link>
          <Link to="/cart" className="flex items-center gap-2 text-brand-dark transition-colors hover:text-sage-600">
            <div className="relative">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-mint-600 text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden text-xs font-medium uppercase tracking-[0.25em] sm:inline">Giỏ Hàng ({cartCount})</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

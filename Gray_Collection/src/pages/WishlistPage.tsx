import React from 'react';
import { Link } from 'react-router-dom';

import { ProductCard } from '../components/ProductCard';
import { useWishlist } from '../context/WishlistContext';

export function WishlistPage() {
  const { items } = useWishlist();

  return (
    <div className="min-h-screen bg-sage-50/20 px-6 pb-24 pt-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-14 border-b border-gray-200 pb-10">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-sage-600">Da luu</p>
          <h1 className="mb-4 text-5xl font-serif italic">Mui huong ban da tha tim</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-brand-gray">
            Luu lai nhung mui huong ban muon test sau, doi gia dep hon, hoac so sanh truoc khi chon size chiet phu hop.
          </p>
        </header>

        {!items.length ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white px-8 py-14 text-center">
            <p className="mb-6 text-brand-gray">Danh sach da luu cua ban dang trong.</p>
            <Link to="/collection" className="inline-block bg-sage-600 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700">
              Kham pha bo suu tap
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
            {items.map((product) => (
              <ProductCard key={product.id} id={product.slug} productId={product.id} name={product.name} brand={product.brand} family={product.family} price={product.price} image={product.image} notes={product.notes} description={product.description} tags={product.tags} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

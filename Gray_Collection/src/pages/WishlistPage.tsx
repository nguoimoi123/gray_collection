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
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-sage-600">Đã lưu</p>
          <h1 className="mb-4 text-5xl font-serif italic">Mùi hương bạn đã thả tim</h1>
          <p className="max-w-2xl text-lg leading-relaxed text-brand-gray">
            Lưu lại những mùi hương bạn muốn test sau, đợi giá đẹp hơn, hoặc so sánh trước khi chọn size chiết phù hợp.
          </p>
        </header>

        {!items.length ? (
          <div className="rounded-[2rem] border border-gray-100 bg-white px-8 py-14 text-center">
            <p className="mb-6 text-brand-gray">Danh sách đã lưu của bạn đang trống.</p>
            <Link to="/collection" className="inline-block bg-sage-600 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700">
              Khám phá bộ sưu tập
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

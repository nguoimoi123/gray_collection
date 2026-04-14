import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { ProductCard } from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import type { UiProduct } from '../types/perfume';

export function ArchivePage() {
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    fetchProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Không thể tải kho lưu trữ lúc này.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const archivedProducts = useMemo(
    () =>
      products
        .filter((product) => !product.inStock)
        .map((product) => ({
          ...product,
          tags: Array.from(new Set(['Archive', ...(product.tags || [])])),
        })),
    [products]
  );

  return (
    <div className="min-h-screen pt-12 pb-24 px-6 max-w-7xl mx-auto">
      <header className="mb-16 border-b border-gray-200 pb-12 text-center">
        <p className="text-[10px] font-bold tracking-widest uppercase text-mint-500 mb-4">Kho lưu trữ</p>
        <h1 className="text-5xl md:text-6xl font-serif italic mb-6">Archive</h1>
        <p className="text-lg text-brand-gray leading-relaxed max-w-2xl mx-auto">
          Nơi hiển thị các mùi hương đang hết hàng hoặc chờ restock để khách vẫn có thể tham khảo lại.
        </p>
      </header>

      {isLoading && (
        <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="mb-6 aspect-[4/5] bg-sage-100" />
              <div className="mb-3 h-6 w-2/3 bg-sage-100" />
              <div className="h-4 w-full bg-sage-100" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && <p className="rounded-3xl bg-red-50 px-6 py-5 text-red-600">{error}</p>}

      {!isLoading && !error && !!archivedProducts.length && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16 opacity-80">
          {archivedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="grayscale hover:grayscale-0 transition-all duration-700"
            >
              <ProductCard
                id={product.slug}
                productId={product.id}
                name={product.name}
                brand={product.brand}
                family={product.family}
                price={product.price}
                image={product.image}
                notes={product.notes}
                description={product.description}
                tags={product.tags}
              />
            </motion.div>
          ))}
        </div>
      )}

      {!isLoading && !error && !archivedProducts.length && (
        <div className="rounded-[2rem] border border-gray-200 px-8 py-12 text-center text-brand-gray">
          Hiện chưa có sản phẩm nào cần chuyển vào kho lưu trữ.
        </div>
      )}
    </div>
  );
}

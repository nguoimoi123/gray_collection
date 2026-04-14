import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

import { ProductCard } from '../components/ProductCard';
import { fetchProducts } from '../services/api';
import type { UiProduct } from '../types/perfume';

type GenderFilter = 'all' | 'female' | 'male' | 'unisex';
type StockFilter = 'all' | 'in-stock';

const genderLabels: Record<GenderFilter, string> = {
  all: 'Tất cả',
  female: 'Nữ',
  male: 'Nam',
  unisex: 'Unisex',
};

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'vi'));
}

export function CollectionPage() {
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState<GenderFilter>('all');
  const [family, setFamily] = useState('all');
  const [brand, setBrand] = useState('all');
  const [mood, setMood] = useState('all');
  const [season, setSeason] = useState('all');
  const [occasion, setOccasion] = useState('all');
  const [size, setSize] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');

    fetchProducts()
      .then((data) => {
        if (active) setProducts(data);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm lúc này.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const families = useMemo(() => ['all', ...uniqueValues(products.map((product) => product.family))], [products]);
  const brands = useMemo(() => ['all', ...uniqueValues(products.map((product) => product.brand))], [products]);
  const moods = useMemo(() => ['all', ...uniqueValues(products.flatMap((product) => product.moodTraits))], [products]);
  const seasons = useMemo(() => ['all', ...uniqueValues(products.flatMap((product) => product.season))], [products]);
  const occasions = useMemo(() => ['all', ...uniqueValues(products.flatMap((product) => product.occasion))], [products]);
  const sizes = useMemo(() => ['all', ...Array.from(new Set(products.flatMap((product) => product.variants.map((variant) => String(variant.size_ml))))).sort((a, b) => Number(a) - Number(b))], [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      if (!product.inStock) return false;
      if (gender !== 'all' && product.gender !== gender) return false;
      if (family !== 'all' && product.family !== family) return false;
      if (brand !== 'all' && product.brand !== brand) return false;
      if (mood !== 'all' && !product.moodTraits.includes(mood)) return false;
      if (season !== 'all' && !product.season.includes(season)) return false;
      if (occasion !== 'all' && !product.occasion.includes(occasion)) return false;
      if (size !== 'all' && !product.variants.some((variant) => String(variant.size_ml) === size)) return false;
      if (stockFilter === 'in-stock' && !product.inStock) return false;
      if (priceRange === 'under-300' && product.price >= 300000) return false;
      if (priceRange === '300-500' && (product.price < 300000 || product.price > 500000)) return false;
      if (priceRange === 'over-500' && product.price <= 500000) return false;
      if (query) {
        const haystack = [product.name, product.brand, product.family, product.description, product.notes, ...product.moodTraits].join(' ').toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
  }, [products, search, gender, family, brand, mood, season, occasion, size, stockFilter, priceRange]);

  const resetFilters = () => {
    setSearch('');
    setGender('all');
    setFamily('all');
    setBrand('all');
    setMood('all');
    setSeason('all');
    setOccasion('all');
    setSize('all');
    setPriceRange('all');
    setStockFilter('all');
  };

  return (
    <div className="min-h-screen px-6 pb-24 pt-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-16 border-b border-gray-200 pb-12">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-mint-500">Gray Perfume</p>
          <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="mb-6 text-5xl font-serif italic md:text-6xl">Bộ sưu tập mùi hương</h1>
              <p className="text-lg leading-relaxed text-brand-gray">Tìm nhanh nước hoa chiết theo thương hiệu, tính chất mùi, dung tích và dịp sử dụng để ra mùi hợp nhất với bạn.</p>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray">Hiển thị {filteredProducts.length} sản phẩm</p>
          </div>
        </header>

        <div className="flex flex-col gap-16 lg:flex-row">
          <aside className="w-full flex-shrink-0 lg:w-72">
            <div className="space-y-10 rounded-[1.75rem] border border-sage-100 bg-sage-50/40 p-6">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.25em]">Tìm kiếm</h3>
                  <button type="button" onClick={resetFilters} className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-gray hover:text-sage-700">Đặt lại</button>
                </div>
                <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tên mùi, brand, note..." className="w-full rounded-2xl border border-sage-100 bg-white px-4 py-3 text-sm focus:border-sage-400 focus:outline-none" />
              </div>

              <div>
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">Đối tượng</h3>
                <div className="space-y-3">
                  {(['all', 'female', 'male', 'unisex'] as GenderFilter[]).map((value) => (
                    <button key={value} type="button" onClick={() => setGender(value)} className={`flex items-center gap-3 text-sm ${gender === value ? 'text-brand-dark' : 'text-brand-gray'}`}>
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${gender === value ? 'border-sage-400 bg-sage-100' : 'border-gray-300'}`}>
                        {gender === value && <span className="h-2 w-2 rounded-full bg-sage-500" />}
                      </span>
                      {genderLabels[value]}
                    </button>
                  ))}
                </div>
              </div>

              <FilterChips title="Thương hiệu" value={brand} onChange={setBrand} options={brands} />
              <FilterChips title="Nhóm mùi" value={family} onChange={setFamily} options={families} />
              <FilterChips title="Tính chất mùi" value={mood} onChange={setMood} options={moods} />
              <FilterChips title="Mùa phù hợp" value={season} onChange={setSeason} options={seasons} />
              <FilterChips title="Dịp sử dụng" value={occasion} onChange={setOccasion} options={occasions} />
              <FilterChips title="Dung tích" value={size} onChange={setSize} options={sizes.map((item) => (item === 'all' ? item : `${item}ml`))} normalize />

              <div>
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">Mức giá</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'Tất cả' },
                    { value: 'under-300', label: 'Dưới 300k' },
                    { value: '300-500', label: '300k - 500k' },
                    { value: 'over-500', label: 'Trên 500k' },
                  ].map((item) => (
                    <button key={item.value} type="button" onClick={() => setPriceRange(item.value)} className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${priceRange === item.value ? 'bg-sage-100 text-sage-800' : 'bg-white text-brand-gray hover:bg-gray-100'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">Trạng thái</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all' as StockFilter, label: 'Toàn bộ' },
                    { value: 'in-stock' as StockFilter, label: 'Còn hàng' },
                  ].map((item) => (
                    <button key={item.value} type="button" onClick={() => setStockFilter(item.value)} className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${stockFilter === item.value ? 'bg-sage-100 text-sage-800' : 'bg-white text-brand-gray hover:bg-gray-100'}`}>
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1">
            {isLoading && (
              <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="mb-6 aspect-[4/5] bg-sage-100" />
                    <div className="mb-3 h-6 w-2/3 bg-sage-100" />
                    <div className="mb-2 h-4 w-1/3 bg-sage-100" />
                    <div className="h-4 w-full bg-sage-100" />
                  </div>
                ))}
              </div>
            )}

            {!isLoading && error && <p className="rounded-3xl bg-red-50 px-6 py-5 text-red-600">{error}</p>}

            {!isLoading && !error && (
              <>
                <div className="grid grid-cols-1 gap-x-8 gap-y-16 md:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product, index) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: index * 0.04 }}>
                      <ProductCard id={product.slug} productId={product.id} name={product.name} brand={product.brand} family={product.family} price={product.price} image={product.image} notes={product.notes} description={product.description} tags={product.tags} />
                    </motion.div>
                  ))}
                </div>

                {!filteredProducts.length && (
                  <div className="mt-12 rounded-[2rem] border border-gray-200 px-8 py-12 text-center text-brand-gray">
                    Không có sản phẩm còn hàng nào khớp với bộ lọc hiện tại. Thử đổi nhóm mùi, dung tích hoặc mức giá để xem thêm.
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterChips({ title, value, onChange, options, normalize = false }: { title: string; value: string; onChange: (value: string) => void; options: string[]; normalize?: boolean; }) {
  return (
    <div>
      <h3 className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {options.map((item) => {
          const optionValue = normalize ? item.replace('ml', '') : item;
          return (
            <button key={item} type="button" onClick={() => onChange(optionValue)} className={`rounded-full px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] transition-colors ${value === optionValue ? 'bg-sage-100 text-sage-800' : 'bg-white text-brand-gray hover:bg-gray-100'}`}>
              {item === 'all' ? 'Tất cả' : item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

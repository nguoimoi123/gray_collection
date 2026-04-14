import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { fetchProducts } from '../services/api';
import type { UiProduct } from '../types/perfume';

const AUTO_SLIDE_MS = 2000;
const CARD_WIDTH = 272;
const CARD_GAP = 16;
const VISIBLE_CARDS = 5;

function buildSlogans(product: UiProduct) {
  const slogans = [...(product.tags || [])].slice(0, 3);

  if (product.price <= 150000 && !slogans.includes('Giá dễ thử')) {
    slogans.push('Giá dễ thử');
  }

  if (product.inStock && !slogans.includes('Sẵn sàng giao')) {
    slogans.push('Sẵn sàng giao');
  }

  return slogans.slice(0, 3);
}

function ProductCarousel({
  title,
  eyebrow,
  description,
  products,
}: {
  title: string;
  eyebrow: string;
  description: string;
  products: UiProduct[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitionEnabled, setIsTransitionEnabled] = useState(true);

  useEffect(() => {
    setActiveIndex(products.length);
    setIsTransitionEnabled(true);
  }, [products]);

  const carouselProducts = useMemo(() => {
    if (products.length === 0) {
      return [];
    }
    return [...products, ...products, ...products];
  }, [products]);

  useEffect(() => {
    if (products.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIsTransitionEnabled(true);
      setActiveIndex((prev) => prev + 1);
    }, AUTO_SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [products.length]);

  const goPrev = () => {
    if (products.length <= 1) return;
    setIsTransitionEnabled(true);
    setActiveIndex((prev) => prev - 1);
  };

  const goNext = () => {
    if (products.length <= 1) return;
    setIsTransitionEnabled(true);
    setActiveIndex((prev) => prev + 1);
  };

  const handleTrackTransitionEnd = () => {
    if (products.length <= 1) {
      return;
    }

    if (activeIndex >= products.length * 2) {
      setIsTransitionEnabled(false);
      setActiveIndex(products.length);
      return;
    }

    if (activeIndex < products.length) {
      setIsTransitionEnabled(false);
      setActiveIndex(products.length + activeIndex);
    }
  };

  useEffect(() => {
    if (isTransitionEnabled) {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setIsTransitionEnabled(true);
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isTransitionEnabled]);

  const translateX = activeIndex * (CARD_WIDTH + CARD_GAP);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)] py-24">
      <div className="mx-auto max-w-[1500px] px-6">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8b6e47]">{eyebrow}</p>
            <h2 className="font-serif text-4xl text-[#2e261e] md:text-5xl">{title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#665847]">{description}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={products.length <= 1}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#cfbea6] bg-white text-[#5a4834] transition hover:bg-[#f5ece0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={18} />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={products.length <= 1}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#cfbea6] bg-white text-[#5a4834] transition hover:bg-[#f5ece0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <div
            onTransitionEnd={handleTrackTransitionEnd}
            className={`flex gap-4 ease-out ${isTransitionEnabled ? 'transition-transform duration-700' : ''}`}
            style={{ transform: `translateX(-${translateX}px)` }}
          >
            {carouselProducts.map((product, index) => (
              <Link
                key={`${title}-${product.id}-${index}`}
                to={`/product/${product.slug}`}
                className="group shrink-0 overflow-hidden rounded-[1.6rem] border border-[#eadcca] bg-white shadow-[0_12px_32px_rgba(56,42,24,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_42px_rgba(56,42,24,0.12)]"
                style={{ width: `${CARD_WIDTH}px`, minWidth: `${CARD_WIDTH}px`, maxWidth: `${CARD_WIDTH}px` }}
              >
                <div className="relative h-[20.5rem] overflow-hidden bg-[linear-gradient(180deg,#fffdf9_0%,#f6eee2_100%)]">
                  <img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute left-4 top-4 flex max-w-[85%] flex-wrap gap-2">
                    {buildSlogans(product).map((slogan) => (
                      <span key={`${title}-${product.id}-${slogan}-${index}`} className="rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-[#755734] backdrop-blur">
                        {slogan}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 px-5 py-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#7c6851]">
                    {product.brand} • {product.family}
                  </p>
                  <h3 className="font-serif text-[1.55rem] leading-tight text-[#241d16]">{product.name}</h3>
                  <p className="line-clamp-2 text-[13px] leading-6 text-[#655643]">{product.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-base font-semibold text-[#241d16]">{product.price.toLocaleString('vi-VN')}đ</span>
                    <span className="rounded-full bg-[#f2e7d8] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#805f38]">
                      {product.inStock ? 'Sẵn sàng' : 'Sắp có'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<UiProduct[]>([]);
  const [newestProducts, setNewestProducts] = useState<UiProduct[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  useEffect(() => {
    fetchProducts()
      .then((products) => {
        const inStockProducts = products.filter((product) => product.inStock);
        const bestSeller = [...inStockProducts]
          .filter((product) => product.tags.includes('Best Seller'))
          .slice(0, 12);
        const newest = [...inStockProducts]
          .filter((product) => product.tags.includes('Moi') || product.tags.includes('Mới') || product.tags.includes('New'))
          .slice(0, 12);

        setFeaturedProducts(bestSeller.length ? bestSeller : inStockProducts.slice(0, 12));
        setNewestProducts(newest.length ? newest : [...inStockProducts].reverse().slice(0, 12));
      })
      .catch(() => {
        setFeaturedProducts([]);
        setNewestProducts([]);
      })
      .finally(() => {
        setLoadingFeatured(false);
      });
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-[90vh] w-full overflow-hidden">
        <img src="../../public/Home_3.jpg" alt="Perfume Hero" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-7xl px-6">
            <div className="max-w-xl text-white">
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]">Gray Collection</p>
              <h1 className="mb-6 text-5xl font-sans font-medium leading-tight md:text-7xl">
                NƯỚC HOA
                <br />
                <span className="font-serif italic font-normal">dành cho bạn</span>
              </h1>
              <p className="mb-10 max-w-md text-lg leading-relaxed text-white/90">
Khám phá thế giới mùi hương nam, nữ và unisex với nhiều lựa chọn 10ml, 30ml, 100ml để dễ test mùi, dễ mang theo và dễ lựa chọn              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/collection" className="bg-sage-600 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-sage-700">
                  Xem bộ sưu tập
                </Link>
                <Link to="/collection" className="border border-white bg-transparent px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-white hover:text-brand-dark">
                  Chọn theo mùi
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loadingFeatured ? (
        <section className="overflow-hidden bg-[linear-gradient(180deg,#fffdfa_0%,#f7f1e7_100%)] py-24">
          <div className="mx-auto max-w-[1500px] px-6">
            <div className="rounded-[2rem] border border-[#eadcca] bg-white/80 px-8 py-20 text-center text-[#6d5b46]">
              Đang tải sản phẩm nổi bật...
            </div>
          </div>
        </section>
      ) : (
        <>
          <ProductCarousel
            eyebrow="Best Seller"
            title="Sản phẩm bán chạy"
            description="Những mùi hương được khách chọn nhiều nhất hiện tại, trình bày theo dạng carousel lặp liên tục."
            products={featuredProducts}
          />
          <ProductCarousel
            eyebrow="New Arrival"
            title="Sản phẩm mới nhất"
            description="Những sản phẩm mới hoặc đang được đẩy mạnh gần đây, tách riêng thành một line carousel để dễ nhìn hơn."
            products={newestProducts}
          />
        </>
      )}

      <section className="bg-brand-light px-6 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              title: 'Chiết tiện dụng',
              text: 'Nhiều size 5ml, 10ml, 20ml để bạn test mùi trước khi mua chai lớn.',
            },
            {
              title: 'Theo tính chất mùi',
              text: 'Dễ chọn theo phong cách như ngọt ngào, quyến rũ, thanh lịch, tươi mát hay sang trọng.',
            },
            {
              title: 'Dữ liệu thật từ shop',
              text: 'Danh mục hiện đang đọc trực tiếp từ backend nên thuận tiện để mở rộng admin và checkout tiếp.',
            },
          ].map((item) => (
            <div key={item.title} className="bg-white p-8">
              <h3 className="mb-3 font-serif text-2xl">{item.title}</h3>
              <p className="leading-relaxed text-brand-gray">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

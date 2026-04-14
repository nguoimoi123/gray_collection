import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, ChevronLeft, ChevronRight, Copy, Loader, Search, Sparkles } from 'lucide-react';

interface Variant {
  size_ml: number;
  price: string | number;
  stock_quantity: number;
  is_default?: boolean;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category?: string;
  target_gender?: string;
  olfactory_family?: string;
  short_description?: string;
  image: string;
  main_image?: string;
  isNew?: boolean;
  tags?: string[];
  price?: string | number;
  default_variant?: Variant | null;
  detail?: {
    subtitle?: string;
    variants?: Variant[];
    inStock?: boolean;
  };
}

const PRODUCTS_PER_PAGE = 9;
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedIds, setCopiedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    axios
      .get(`${API_URL}/products/`)
      .then((response) => setProducts(response.data))
      .catch(() => setError('Khong the tai du lieu san pham. Vui long thu lai sau.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return products.filter((product) =>
      [product.name, product.brand, product.olfactory_family, product.short_description]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [products, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PRODUCTS_PER_PAGE, currentPage * PRODUCTS_PER_PAGE);

  const formatPrice = (value: string | number) => Number(value || 0).toLocaleString('vi-VN') + 'đ';

  const getDefaultVariant = (product: Product) => {
    const detailVariant = (product.detail?.variants || []).find((item) => item.is_default) || product.detail?.variants?.[0];
    return detailVariant || product.default_variant || null;
  };

  const handleCopyId = async (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    await navigator.clipboard.writeText(productId);
    setCopiedIds((prev) => new Set(prev).add(productId));
    setTimeout(() => {
      setCopiedIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }, 1800);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader className="mr-2 h-8 w-8 animate-spin text-blue-600" />Dang tai san pham...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-500"><AlertCircle className="mr-2 h-8 w-8" />{error}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">San pham nuoc hoa</h1>
        <p className="mb-6 text-gray-600">Quan ly danh muc nuoc hoa chiet, nhom mui va bien the 5ml/10ml/20ml.</p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tim theo ten, thuong hieu, nhom mui..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </motion.div>

      {paginatedProducts.length ? (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {paginatedProducts.map((product, index) => {
              const variant = getDefaultVariant(product);
              const stockCount = variant ? Number(variant.stock_quantity || 0) : 0;
              const isInStock = typeof product.detail?.inStock === 'boolean' ? product.detail.inStock : stockCount > 0;
              const visibleTags = [product.category || 'nuoc hoa chiet', ...(product.tags || [])].filter(Boolean).slice(0, 2);

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => navigate(`/products/${product.id}`)}
                  className="cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-lg"
                >
                  <div className="relative h-56 overflow-hidden bg-gray-100">
                    <img src={product.main_image || product.image} alt={product.name} className="h-full w-full object-cover" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {visibleTags.map((tag) => (
                        <span key={tag} className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{product.brand} • {product.olfactory_family || 'Dang cap nhat'}</p>
                      </div>
                      <button onClick={(event) => handleCopyId(product.id, event)} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
                        {copiedIds.has(product.id) ? '✓' : <Copy size={15} />}
                      </button>
                    </div>

                    <p className="line-clamp-2 text-sm text-gray-600">{product.detail?.subtitle || product.short_description || 'Chua co mo ta ngan cho san pham nay.'}</p>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                      <div>
                        <p className="font-semibold text-gray-900">{variant ? formatPrice(variant.price) : product.price ? formatPrice(product.price) : 'Chua co gia'}</p>
                        <p className="text-gray-500">{variant ? `${variant.size_ml}ml • ton ${variant.stock_quantity}` : 'Dang xem gia mac dinh'}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${isInStock ? 'text-emerald-600' : 'text-red-500'}`}>{isInStock ? 'Con hang' : 'Het hang'}</p>
                        <p className="text-gray-500">Tong ton {stockCount}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="rounded-full bg-gray-100 px-3 py-1 uppercase tracking-[0.2em]">{product.target_gender || 'unisex'}</span>
                      <span className="inline-flex items-center gap-1"><Sparkles size={12} />ID: {product.id}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button type="button" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                <ChevronLeft size={16} /> Truoc
              </button>
              <span className="px-2 text-sm text-gray-600">Trang {currentPage}/{totalPages}</span>
              <button type="button" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
                Sau <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center text-gray-500">Khong tim thay san pham nao phu hop.</div>
      )}
    </div>
  );
}

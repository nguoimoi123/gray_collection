import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Loader, Package } from 'lucide-react';

interface Variant {
  size_ml: number;
  price: string | number;
  original_price?: string | number;
  stock_quantity: number;
  sku?: string;
  is_default?: boolean;
}

interface ProductDetailData {
  id: string;
  name: string;
  brand: string;
  category: string;
  image: string;
  main_image?: string;
  target_gender?: string;
  olfactory_family?: string;
  short_description?: string;
  mood_traits?: string[];
  tags?: string[];
  detail?: {
    subtitle?: string;
    description?: string;
    story?: string;
    top_notes?: string[];
    heart_notes?: string[];
    base_notes?: string[];
    season?: string[];
    occasion?: string[];
    longevity?: string;
    sillage?: string;
    images?: string[];
    variants?: Variant[];
    inStock?: boolean;
  };
}

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  useEffect(() => {
    if (!productId) {
      setError('ID san pham khong hop le.');
      setLoading(false);
      return;
    }

    axios
      .get(`${API_URL}/products/${productId}/`)
      .then((response) => {
        setProduct(response.data);
        setSelectedImageIdx(0);
      })
      .catch(() => setError('Khong the tai thong tin san pham.'))
      .finally(() => setLoading(false));
  }, [productId]);

  const images = useMemo(() => {
    if (!product) return [];
    return product.detail?.images?.length ? product.detail.images : [product.main_image || product.image];
  }, [product]);

  const currentImage = images[selectedImageIdx] || product?.main_image || product?.image || '';
  const variants = product?.detail?.variants || [];

  const formatPrice = (value: string | number) => Number(value || 0).toLocaleString('vi-VN') + 'đ';

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader className="mr-2 h-8 w-8 animate-spin text-blue-600" />Dang tai thong tin san pham...</div>;
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <button onClick={() => navigate('/products')} className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> Quay lai danh sach san pham
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <AlertCircle size={22} />
          <span>{error || 'Khong tim thay san pham.'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <button onClick={() => navigate('/products')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> Quay lai danh sach san pham
        </button>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-gray-100 shadow-inner">
            <img src={currentImage} alt={product.name} className="h-full w-full object-contain" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto py-2">
              {images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${product.name} ${index + 1}`}
                  className={`h-20 w-20 cursor-pointer rounded-lg object-cover border-2 ${selectedImageIdx === index ? 'border-blue-500' : 'border-transparent opacity-70 hover:opacity-100'}`}
                  onClick={() => setSelectedImageIdx(index)}
                />
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
              {(product.tags || []).map((tag) => (
                <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-700">{tag}</span>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500">{product.brand} • {product.olfactory_family || 'Nhom mui dang cap nhat'} • {product.target_gender || 'unisex'}</p>
            <p className="mt-3 text-lg text-gray-700">{product.detail?.subtitle || product.short_description || 'Chua co subtitle cho san pham nay.'}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div>
              <p className="text-sm text-gray-500">Danh muc</p>
              <p className="font-medium text-gray-900">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ton kho</p>
              <p className={`font-medium ${product.detail?.inStock ? 'text-emerald-600' : 'text-red-500'}`}>{product.detail?.inStock ? 'Con hang' : 'Tam het hang'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Do luu huong</p>
              <p className="font-medium text-gray-900">{product.detail?.longevity || 'Dang cap nhat'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Do toa huong</p>
              <p className="font-medium text-gray-900">{product.detail?.sillage || 'Dang cap nhat'}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Mo ta</h2>
            <p className="rounded-2xl bg-gray-50 p-5 leading-7 text-gray-700">{product.detail?.description || 'Chua co mo ta chi tiet.'}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <InfoList title="Huong dau" values={product.detail?.top_notes || []} />
            <InfoList title="Huong giua" values={product.detail?.heart_notes || []} />
            <InfoList title="Huong cuoi" values={product.detail?.base_notes || []} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InfoList title="Tinh chat mui" values={product.mood_traits || []} />
            <InfoList title="Dip su dung" values={product.detail?.occasion || []} />
            <InfoList title="Season" values={product.detail?.season || []} />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Bien the dung tich</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Size</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Gia ban</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Gia goc</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ton kho</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">SKU</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Mac dinh</th>
              </tr>
            </thead>
            <tbody>
              {variants.length ? (
                variants.map((variant) => (
                  <tr key={`${variant.size_ml}-${variant.sku || 'variant'}`} className="border-t border-gray-100">
                    <td className="px-6 py-4 font-medium text-gray-900">{variant.size_ml}ml</td>
                    <td className="px-6 py-4 text-gray-700">{formatPrice(variant.price)}</td>
                    <td className="px-6 py-4 text-gray-500">{variant.original_price ? formatPrice(variant.original_price) : '—'}</td>
                    <td className="px-6 py-4 text-gray-700">{variant.stock_quantity}</td>
                    <td className="px-6 py-4 text-gray-500">{variant.sku || '—'}</td>
                    <td className="px-6 py-4">{variant.is_default ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Mac dinh</span> : '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chua co bien the dung tich nao.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {product.detail?.story && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-3 flex items-center gap-2">
            <Package size={18} className="text-amber-500" />
            <h2 className="text-lg font-semibold text-gray-900">Story</h2>
          </div>
          <p className="leading-7 text-gray-700">{product.detail.story}</p>
        </motion.div>
      )}
    </div>
  );
}

function InfoList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-gray-700">{title}</h3>
      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <span key={value} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{value}</span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Dang cap nhat</p>
      )}
    </div>
  );
}

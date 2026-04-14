import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Gift, Loader2, Plus, Save, Trash2 } from 'lucide-react';

type Variant = {
  size_ml: number;
  price: string | number;
  stock_quantity: number;
  is_default?: boolean;
};

type Product = {
  id: string;
  name: string;
  brand: string;
  image: string;
  main_image?: string;
  default_variant?: Variant | null;
  detail?: {
    variants?: Variant[];
  };
};

type GiftSetItemForm = {
  product_id: string;
  variant_size_ml: number | '';
  quantity: number;
  bonus_gift: string;
};

type GiftSet = {
  id: string;
  slug: string;
  title: string;
  occasion_label?: string;
  campaign_label?: string;
  description?: string;
  gift_note?: string;
  cover_image?: string;
  bonus_gift?: string;
  is_active: boolean;
  total_price: number;
  items: Array<{
    product_id: string;
    quantity: number;
    variant_size_ml?: number;
    product?: { name: string; brand: string } | null;
  }>;
};

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

const emptyForm = {
  title: '',
  slug: '',
  occasion_label: '',
  campaign_label: '',
  description: '',
  gift_note: '',
  cover_image: '',
  bonus_gift: '',
  is_active: true,
  items: [{ product_id: '', variant_size_ml: '', quantity: 1, bonus_gift: '' }] as GiftSetItemForm[],
};

export function GiftSetsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [giftSets, setGiftSets] = useState<GiftSet[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsResponse, giftSetsResponse] = await Promise.all([
        axios.get<Product[]>(`${API_URL}/products/`),
        axios.get<GiftSet[]>(`${API_URL}/gift-sets/`),
      ]);
      setProducts(productsResponse.data || []);
      setGiftSets(giftSetsResponse.data || []);
    } catch {
      setError('Khong tai duoc gift set hoac danh sach san pham.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'vi')),
    [products]
  );

  const ensureProductDetail = async (productId: string) => {
    if (!productId || productDetails[productId]) return;
    try {
      const response = await axios.get<Product>(`${API_URL}/products/${productId}/`);
      setProductDetails((prev) => ({ ...prev, [productId]: response.data }));
    } catch {
      setError('Khong tai duoc bien the cho san pham vua chon.');
    }
  };

  const handleItemChange = async (index: number, field: keyof GiftSetItemForm, value: string | number) => {
    setForm((prev) => {
      const nextItems = prev.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
              ...(field === 'product_id' ? { variant_size_ml: '' } : {}),
            }
          : item
      );
      return { ...prev, items: nextItems };
    });

    if (field === 'product_id' && typeof value === 'string') {
      await ensureProductDetail(value);
    }
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', variant_size_ml: '', quantity: 1, bonus_gift: '' }],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length === 1 ? prev.items : prev.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const buildPayload = () => ({
    title: form.title,
    slug: form.slug,
    occasion_label: form.occasion_label,
    campaign_label: form.campaign_label,
    description: form.description,
    gift_note: form.gift_note,
    cover_image: form.cover_image,
    bonus_gift: form.bonus_gift,
    is_active: form.is_active,
    items: form.items.map((item) => ({
      product_id: item.product_id,
      variant_size_ml: item.variant_size_ml || null,
      quantity: Number(item.quantity) || 1,
      bonus_gift: item.bonus_gift,
    })),
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        await axios.put(`${API_URL}/gift-sets/${editingId}/`, buildPayload());
      } else {
        await axios.post(`${API_URL}/gift-sets/`, buildPayload());
      }
      await fetchInitialData();
      resetForm();
    } catch (submitError: any) {
      setError(submitError?.response?.data?.error || 'Khong luu duoc gift set.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (giftSet: GiftSet) => {
    for (const item of giftSet.items) {
      await ensureProductDetail(item.product_id);
    }
    setEditingId(giftSet.id);
    setForm({
      title: giftSet.title || '',
      slug: giftSet.slug || '',
      occasion_label: giftSet.occasion_label || '',
      campaign_label: giftSet.campaign_label || '',
      description: giftSet.description || '',
      gift_note: giftSet.gift_note || '',
      cover_image: giftSet.cover_image || '',
      bonus_gift: giftSet.bonus_gift || '',
      is_active: giftSet.is_active,
      items: giftSet.items.map((item) => ({
        product_id: item.product_id,
        variant_size_ml: item.variant_size_ml || '',
        quantity: item.quantity || 1,
        bonus_gift: '',
      })),
    });
  };

  const handleDelete = async (giftSetId: string) => {
    try {
      await axios.delete(`${API_URL}/gift-sets/${giftSetId}/`);
      if (editingId === giftSetId) {
        resetForm();
      }
      await fetchInitialData();
    } catch {
      setError('Khong xoa duoc gift set nay.');
    }
  };

  const getVariants = (productId: string) => {
    const detailProduct = productDetails[productId];
    const variants = detailProduct?.detail?.variants || [];
    return variants.length ? variants : detailProduct?.default_variant ? [detailProduct.default_variant] : [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-600">
        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
        Dang tai gift set...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Gift Sets</h1>
          <p className="mt-2 max-w-3xl text-gray-600">
            Tao cac set theo dip, le, sale hoac concept shop muon day. Moi set co the chon san pham, ml, so luong va qua tang kem.
          </p>
        </div>
        <button type="button" onClick={resetForm} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
          Tao set moi
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-700">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Sua gift set' : 'Tao gift set moi'}</h2>
              <p className="text-sm text-gray-500">Ban co the dung de lam set sinh nhat, valentine, sale, qua cong ty.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Input label="Ten gift set" value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} placeholder="Vi du: Set 20/10 cho co nang thanh lich" />
            <Input label="Slug" value={form.slug} onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))} placeholder="tu dong neu de trong" />
            <Input label="Dip / le" value={form.occasion_label} onChange={(value) => setForm((prev) => ({ ...prev, occasion_label: value }))} placeholder="20/10, Valentine, Sinh nhat..." />
            <Input label="Tag sale / chien dich" value={form.campaign_label} onChange={(value) => setForm((prev) => ({ ...prev, campaign_label: value }))} placeholder="Flash sale, Qua tang doc dao..." />
            <Input label="Anh cover" value={form.cover_image} onChange={(value) => setForm((prev) => ({ ...prev, cover_image: value }))} placeholder="https://..." className="md:col-span-2" />
            <TextArea label="Mo ta" value={form.description} onChange={(value) => setForm((prev) => ({ ...prev, description: value }))} placeholder="Set nay hop voi ai, vi sao nen mua..." className="md:col-span-2" />
            <TextArea label="Ghi chu gift note" value={form.gift_note} onChange={(value) => setForm((prev) => ({ ...prev, gift_note: value }))} placeholder="Co the kem thiep viet tay, ribbon, concept dong goi..." />
            <TextArea label="Qua tang kem" value={form.bonus_gift} onChange={(value) => setForm((prev) => ({ ...prev, bonus_gift: value }))} placeholder="Thiệp, sample, túi giấy, voucher..." />
          </div>

          <label className="mt-5 flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              className="h-4 w-4 rounded border-gray-300"
            />
            Gift set dang hoat dong tren frontend user
          </label>

          <div className="mt-8">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Cac mon trong set</h3>
              <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Them mon
              </button>
            </div>

            <div className="space-y-4">
              {form.items.map((item, index) => {
                const variants = getVariants(item.product_id);
                return (
                  <div key={`gift-set-item-${index}`} className="rounded-2xl border border-gray-200 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">Mon {index + 1}</p>
                      <button type="button" onClick={() => removeItem(index)} className="text-sm text-red-500 transition hover:text-red-600">
                        Xoa
                      </button>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[1.7fr_0.7fr_0.6fr]">
                      <label className="text-sm text-gray-600">
                        <span className="mb-2 block">San pham</span>
                        <select
                          value={item.product_id}
                          onChange={(event) => handleItemChange(index, 'product_id', event.target.value)}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                        >
                          <option value="">Chon san pham</option>
                          {sortedProducts.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.brand} - {product.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="text-sm text-gray-600">
                        <span className="mb-2 block">Ml</span>
                        <select
                          value={item.variant_size_ml}
                          onChange={(event) => handleItemChange(index, 'variant_size_ml', Number(event.target.value))}
                          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 focus:border-blue-500 focus:outline-none"
                          disabled={!item.product_id}
                        >
                          <option value="">Chon ml</option>
                          {variants.map((variant) => (
                            <option key={`${item.product_id}-${variant.size_ml}`} value={variant.size_ml}>
                              {variant.size_ml}ml
                            </option>
                          ))}
                        </select>
                      </label>

                      <Input
                        label="So luong"
                        type="number"
                        min={1}
                        value={String(item.quantity)}
                        onChange={(value) => handleItemChange(index, 'quantity', Number(value))}
                      />
                    </div>

                    <TextArea
                      label="Qua tang kem rieng cho mon nay"
                      value={item.bonus_gift}
                      onChange={(value) => handleItemChange(index, 'bonus_gift', value)}
                      placeholder="Vi du: sample mini, tag ten, note viet tay..."
                      className="mt-3"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingId ? 'Cap nhat gift set' : 'Luu gift set'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                Huy sua
              </button>
            )}
          </div>
        </form>

        <div className="space-y-4">
          {giftSets.map((giftSet) => (
            <article key={giftSet.id} className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-600">
                    {[giftSet.occasion_label, giftSet.campaign_label].filter(Boolean).join(' • ') || 'Gift set'}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-gray-900">{giftSet.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-500">{giftSet.description || 'Chua co mo ta cho gift set nay.'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${giftSet.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                  {giftSet.is_active ? 'Dang hien' : 'Dang an'}
                </span>
              </div>

              <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
                {giftSet.items.map((item, index) => (
                  <div key={`${giftSet.id}-summary-${index}`} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.product?.name || item.product_id}</p>
                      <p className="text-gray-500">
                        {item.product?.brand || 'Gray Collection'} • {item.variant_size_ml || 0}ml • SL {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>{giftSet.items.length} mon trong set</span>
                <span className="font-semibold text-gray-900">{Number(giftSet.total_price || 0).toLocaleString('vi-VN')}đ</span>
              </div>

              <div className="mt-5 flex gap-3">
                <button type="button" onClick={() => handleEdit(giftSet)} className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
                  Sua
                </button>
                <button type="button" onClick={() => handleDelete(giftSet.id)} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50">
                  <Trash2 className="h-4 w-4" />
                  Xoa
                </button>
              </div>
            </article>
          ))}

          {!giftSets.length && (
            <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
              Chua co gift set nao. Ban co the tao set dau tien o khung ben trai.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  min,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: number;
  className?: string;
}) {
  return (
    <label className={`text-sm text-gray-600 ${className}`}>
      <span className="mb-2 block">{label}</span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  className = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`text-sm text-gray-600 ${className}`}>
      <span className="mb-2 block">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
      />
    </label>
  );
}

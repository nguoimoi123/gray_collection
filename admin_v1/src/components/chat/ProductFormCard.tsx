import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle, Loader2, Package, Plus, Sparkles, Trash2, X } from 'lucide-react';

import { chatService } from '../../services/api';
import { ProductFormData, ProductVariantFormData } from '../../types/chat';

interface ProductFormCardProps {
  isDark: boolean;
  prefill?: Partial<ProductFormData>;
  onSuccess: (productName: string) => void;
}

const createVariant = (preset?: Partial<ProductVariantFormData>): ProductVariantFormData => ({
  size_ml: String(preset?.size_ml ?? ''),
  price: String(preset?.price ?? ''),
  original_price: String(preset?.original_price ?? ''),
  stock_quantity: String(preset?.stock_quantity ?? '0'),
  sku: String(preset?.sku ?? ''),
  is_default: Boolean(preset?.is_default),
});

const DEFAULT_VARIANTS = [createVariant({ size_ml: '5', stock_quantity: '20', is_default: true }), createVariant({ size_ml: '10', stock_quantity: '20' }), createVariant({ size_ml: '20', stock_quantity: '20' })];

export function ProductFormCard({ isDark, prefill, onSuccess }: ProductFormCardProps) {
  const normalizedSpecs = prefill?.specifications
    ? Array.isArray(prefill.specifications)
      ? prefill.specifications
      : Object.entries(prefill.specifications).map(([key, value]) => ({ key, value: String(value) }))
    : [{ key: '', value: '' }];

  const normalizedVariants = Array.isArray(prefill?.variants) && prefill?.variants.length ? prefill.variants.map((item) => createVariant(item)) : DEFAULT_VARIANTS;

  const [form, setForm] = useState<ProductFormData>({
    id: prefill?.id,
    slug: String(prefill?.slug ?? ''),
    name: String(prefill?.name ?? ''),
    price: String(prefill?.price ?? ''),
    originalPrice: String(prefill?.originalPrice ?? ''),
    category: String(prefill?.category ?? ''),
    brand: String(prefill?.brand ?? ''),
    description: String(prefill?.description ?? ''),
    short_description: String(prefill?.short_description ?? ''),
    subtitle: String(prefill?.subtitle ?? ''),
    story: String(prefill?.story ?? ''),
    target_gender: prefill?.target_gender ?? 'unisex',
    olfactory_family: String(prefill?.olfactory_family ?? ''),
    mood_traits: Array.isArray(prefill?.mood_traits) ? prefill.mood_traits : [''],
    top_notes: Array.isArray(prefill?.top_notes) ? prefill.top_notes : [''],
    heart_notes: Array.isArray(prefill?.heart_notes) ? prefill.heart_notes : [''],
    base_notes: Array.isArray(prefill?.base_notes) ? prefill.base_notes : [''],
    season: Array.isArray(prefill?.season) ? prefill.season : [''],
    occasion: Array.isArray(prefill?.occasion) ? prefill.occasion : [''],
    longevity: String(prefill?.longevity ?? ''),
    sillage: String(prefill?.sillage ?? ''),
    tags: Array.isArray(prefill?.tags) ? prefill.tags : [''],
    features: Array.isArray(prefill?.features) ? prefill.features : [''],
    specifications: normalizedSpecs,
    variants: normalizedVariants,
    isNew: prefill?.isNew ?? false,
    inStock: prefill?.inStock ?? true,
    mainImage: prefill?.mainImage ?? '',
    galleryImages: prefill?.galleryImages ?? [],
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const mainImgInputRef = useRef<HTMLInputElement>(null);
  const galleryImgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([chatService.getCategories(), chatService.getBrands()])
      .then(([catRes, brandRes]) => {
        setCategories(catRes);
        setBrands(brandRes);
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  const setField = (field: keyof ProductFormData, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateListField = (field: keyof ProductFormData, index: number, value: string) => {
    const list = Array.isArray(form[field]) ? ([...(form[field] as string[])] as string[]) : [];
    list[index] = value;
    setField(field, list);
  };

  const addListField = (field: keyof ProductFormData) => {
    const list = Array.isArray(form[field]) ? ([...(form[field] as string[])] as string[]) : [];
    setField(field, [...list, '']);
  };

  const removeListField = (field: keyof ProductFormData, index: number) => {
    const list = Array.isArray(form[field]) ? ([...(form[field] as string[])] as string[]) : [];
    setField(field, list.filter((_, itemIndex) => itemIndex !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', value: string) => {
    const list = [...form.specifications];
    list[index] = { ...list[index], [field]: value };
    setField('specifications', list);
  };

  const addSpec = () => setField('specifications', [...form.specifications, { key: '', value: '' }]);
  const removeSpec = (index: number) => setField('specifications', form.specifications.filter((_, itemIndex) => itemIndex !== index));

  const updateVariant = (index: number, field: keyof ProductVariantFormData, value: string | boolean) => {
    const list = [...(form.variants || [])];
    if (field === 'is_default' && value) {
      list.forEach((item) => {
        item.is_default = false;
      });
    }
    list[index] = { ...list[index], [field]: value };
    setField('variants', list);
  };

  const addVariant = () => setField('variants', [...(form.variants || []), createVariant()]);
  const removeVariant = (index: number) => setField('variants', (form.variants || []).filter((_, itemIndex) => itemIndex !== index));

  const handleMainImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    setMainImageFile(file);
    setMainImagePreview(URL.createObjectURL(file));
    setField('mainImage', '');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const files = Array.from(event.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => setImagePreviews((prev) => [...prev, URL.createObjectURL(file)]));
  };

  const clearMainImage = () => {
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    setMainImageFile(null);
    setMainImagePreview('');
    setField('mainImage', '');
  };

  const handleAiSuggest = async () => {
    if (!form.name.trim()) return;
    setIsAiSuggesting(true);
    try {
      const prompt = `Hay goi y noi dung cho san pham nuoc hoa chiet voi ten "${form.name}", thuong hieu "${form.brand}", nhom mui "${form.olfactory_family}". Tra ve du lieu dung de dien form admin, uu tien subtitle, short_description, story, mood_traits, top_notes, heart_notes, base_notes, season, occasion va variants 5ml/10ml/20ml.`;
      const data = await chatService.sendMessage(prompt, 'admin', [], [], false);
      if (data.action === 'show_product_form' && data.prefill) {
        setForm((prev) => ({
          ...prev,
          ...data.prefill,
          mood_traits: Array.isArray(data.prefill.mood_traits) ? data.prefill.mood_traits : prev.mood_traits,
          top_notes: Array.isArray(data.prefill.top_notes) ? data.prefill.top_notes : prev.top_notes,
          heart_notes: Array.isArray(data.prefill.heart_notes) ? data.prefill.heart_notes : prev.heart_notes,
          base_notes: Array.isArray(data.prefill.base_notes) ? data.prefill.base_notes : prev.base_notes,
          season: Array.isArray(data.prefill.season) ? data.prefill.season : prev.season,
          occasion: Array.isArray(data.prefill.occasion) ? data.prefill.occasion : prev.occasion,
          tags: Array.isArray(data.prefill.tags) ? data.prefill.tags : prev.tags,
          variants: Array.isArray(data.prefill.variants) && data.prefill.variants.length ? data.prefill.variants.map((item) => createVariant(item)) : prev.variants,
        }));
      }
    } catch {
      // ignore
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError('Vui long nhap ten san pham.');
    if (!form.brand.trim()) return setError('Vui long chon thuong hieu.');
    if (!form.category.trim()) return setError('Vui long chon danh muc.');
    if (!(form.variants || []).length) return setError('Vui long them it nhat 1 bien the dung tich.');

    setError('');
    setIsSubmitting(true);

    try {
      const normalizedSpecs = form.specifications
        .filter((item) => item.key.trim())
        .reduce<Record<string, string>>((acc, item) => {
          acc[item.key.trim()] = item.value.trim();
          return acc;
        }, {});

      const normalizedVariants = (form.variants || [])
        .filter((item) => item.size_ml && item.price)
        .map((item, index) => ({
          size_ml: Number(item.size_ml),
          price: Number(item.price),
          original_price: item.original_price ? Number(item.original_price) : undefined,
          stock_quantity: Number(item.stock_quantity || 0),
          sku: item.sku?.trim() || undefined,
          is_default: Boolean(item.is_default || index === 0),
        }));

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug?.trim() || undefined,
        price: normalizedVariants[0]?.price || Number(form.price || 0),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : normalizedVariants[0]?.original_price,
        category: form.category.trim(),
        brand: form.brand.trim(),
        description: form.description.trim(),
        short_description: form.short_description?.trim(),
        subtitle: form.subtitle?.trim(),
        story: form.story?.trim(),
        target_gender: form.target_gender,
        olfactory_family: form.olfactory_family?.trim(),
        mood_traits: (form.mood_traits || []).map((item) => item.trim()).filter(Boolean),
        top_notes: (form.top_notes || []).map((item) => item.trim()).filter(Boolean),
        heart_notes: (form.heart_notes || []).map((item) => item.trim()).filter(Boolean),
        base_notes: (form.base_notes || []).map((item) => item.trim()).filter(Boolean),
        season: (form.season || []).map((item) => item.trim()).filter(Boolean),
        occasion: (form.occasion || []).map((item) => item.trim()).filter(Boolean),
        longevity: form.longevity?.trim(),
        sillage: form.sillage?.trim(),
        tags: (form.tags || []).map((item) => item.trim()).filter(Boolean),
        features: form.features.map((item) => item.trim()).filter(Boolean),
        specifications: normalizedSpecs,
        variants: normalizedVariants,
        isNew: form.isNew,
        inStock: form.inStock,
      };

      if (form.id) {
        payload.product_id = form.id;
        payload.mainImage = form.mainImage || '';
        payload.galleryImages = form.galleryImages || [];
      }

      const uploadFiles: File[] = [];
      if (mainImageFile) uploadFiles.push(mainImageFile);
      uploadFiles.push(...imageFiles);

      const result = await chatService.sendMessage(
        form.id ? `Cap nhat san pham ${form.name}` : `Them san pham ${form.name}`,
        'admin',
        [],
        uploadFiles,
        true,
        {
          action: form.id ? 'update_product' : 'add_product',
          payload,
        }
      );

      if (result.success && result.action !== 'show_product_form') {
        setSubmitted(true);
        onSuccess(form.name);
      } else {
        setError(result.error || 'Khong the luu san pham.');
      }
    } catch {
      setError('Ket noi may chu that bai.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = `w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all ${isDark ? 'border-slate-700 bg-slate-950/50 text-white placeholder:text-slate-500 focus:border-cyan-500' : 'border-slate-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500'}`;
  const labelClass = `mb-1 block text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`;

  if (submitted) {
    return (
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`flex items-center gap-3 rounded-2xl border p-5 ${isDark ? 'border-emerald-700 bg-emerald-900/30' : 'border-emerald-200 bg-emerald-50'}`}>
        <CheckCircle size={24} className="text-emerald-500" />
        <div>
          <p className={`font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>Luu san pham thanh cong</p>
          <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{form.name} da duoc cap nhat vao kho nuoc hoa.</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`overflow-hidden rounded-2xl border shadow-xl ${isDark ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between gap-3 border-b border-dashed border-slate-300/70 bg-gradient-to-r from-amber-500/10 to-rose-500/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 text-white">
            <Package size={16} />
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-gray-800'}`}>{form.id ? 'Chinh sua san pham' : 'Them san pham moi'}</p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Form nay da duoc doi sang domain nuoc hoa chiet.</p>
          </div>
        </div>
        <button
          onClick={handleAiSuggest}
          disabled={isAiSuggesting || !form.name.trim()}
          className={`rounded-xl px-3 py-2 text-xs font-semibold ${isAiSuggesting ? 'cursor-wait bg-violet-500 text-white opacity-70' : !form.name.trim() ? 'cursor-not-allowed bg-slate-100 text-slate-400' : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'}`}
        >
          {isAiSuggesting ? <span className="inline-flex items-center gap-1"><Loader2 size={12} className="animate-spin" />Dang goi y...</span> : <span className="inline-flex items-center gap-1"><Sparkles size={12} />AI goi y</span>}
        </button>
      </div>

      <div className="space-y-5 px-5 py-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass}>Ten san pham</label>
            <input className={inputClass} value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="VD: Delina" />
          </div>
          <div>
            <label className={labelClass}>Slug</label>
            <input className={inputClass} value={form.slug} onChange={(event) => setField('slug', event.target.value)} placeholder="delina" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className={labelClass}>Danh muc</label>
            <select className={inputClass} value={form.category} onChange={(event) => setField('category', event.target.value)} disabled={loadingOptions}>
              <option value="">{loadingOptions ? 'Dang tai...' : '-- Chon danh muc --'}</option>
              {categories.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Thuong hieu</label>
            <select className={inputClass} value={form.brand} onChange={(event) => setField('brand', event.target.value)} disabled={loadingOptions}>
              <option value="">{loadingOptions ? 'Dang tai...' : '-- Chon thuong hieu --'}</option>
              {brands.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass}>Doi tuong</label>
            <select className={inputClass} value={form.target_gender} onChange={(event) => setField('target_gender', event.target.value as ProductFormData['target_gender'])}>
              <option value="female">Nu</option>
              <option value="male">Nam</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass}>Nhom mui</label>
            <input className={inputClass} value={form.olfactory_family} onChange={(event) => setField('olfactory_family', event.target.value)} placeholder="Floral Woody Musk" />
          </div>
          <div>
            <label className={labelClass}>Subtitle</label>
            <input className={inputClass} value={form.subtitle} onChange={(event) => setField('subtitle', event.target.value)} placeholder="Nu tinh, quy phai, thanh lich" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Mo ta ngan</label>
          <input className={inputClass} value={form.short_description} onChange={(event) => setField('short_description', event.target.value)} placeholder="Mo ta ngan de hien thi tren card san pham" />
        </div>

        <div>
          <label className={labelClass}>Mo ta chi tiet</label>
          <textarea className={`${inputClass} min-h-[84px] resize-none`} value={form.description} onChange={(event) => setField('description', event.target.value)} placeholder="Mo ta chi tiet san pham" />
        </div>

        <div>
          <label className={labelClass}>Story</label>
          <textarea className={`${inputClass} min-h-[84px] resize-none`} value={form.story} onChange={(event) => setField('story', event.target.value)} placeholder="Cau chuyen mui huong, boi canh, cam hung..." />
        </div>

        <PerfumeListEditor title="Tinh chat mui" field="mood_traits" form={form} updateListField={updateListField} addListField={addListField} removeListField={removeListField} inputClass={inputClass} isDark={isDark} />
        <PerfumeListEditor title="Huong dau" field="top_notes" form={form} updateListField={updateListField} addListField={addListField} removeListField={removeListField} inputClass={inputClass} isDark={isDark} />
        <PerfumeListEditor title="Huong giua" field="heart_notes" form={form} updateListField={updateListField} addListField={addListField} removeListField={removeListField} inputClass={inputClass} isDark={isDark} />
        <PerfumeListEditor title="Huong cuoi" field="base_notes" form={form} updateListField={updateListField} addListField={addListField} removeListField={removeListField} inputClass={inputClass} isDark={isDark} />
        <PerfumeListEditor title="Season" field="season" form={form} updateListField={updateListField} addListField={addListField} removeListField={removeListField} inputClass={inputClass} isDark={isDark} />
        <PerfumeListEditor title="Occasion" field="occasion" form={form} updateListField={updateListField} addListField={addListField} removeListField={removeListField} inputClass={inputClass} isDark={isDark} />
        <PerfumeListEditor title="Tags" field="tags" form={form} updateListField={updateListField} addListField={addListField} removeListField={removeListField} inputClass={inputClass} isDark={isDark} />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className={labelClass}>Do luu huong</label>
            <input className={inputClass} value={form.longevity} onChange={(event) => setField('longevity', event.target.value)} placeholder="6-8 gio" />
          </div>
          <div>
            <label className={labelClass}>Do toa huong</label>
            <input className={inputClass} value={form.sillage} onChange={(event) => setField('sillage', event.target.value)} placeholder="Vua / Xa" />
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass + ' !mb-0'}>Bien the dung tich</label>
            <button onClick={addVariant} className={`rounded-lg px-2 py-1 text-xs ${isDark ? 'text-cyan-400 hover:bg-cyan-900/20' : 'text-blue-600 hover:bg-blue-50'}`}><Plus size={12} className="inline mr-1" />Them</button>
          </div>
          <div className="space-y-3">
            {(form.variants || []).map((variant, index) => (
              <div key={index} className={`grid grid-cols-1 gap-2 rounded-xl border p-3 md:grid-cols-5 ${isDark ? 'border-slate-700 bg-slate-950/30' : 'border-slate-200 bg-slate-50/60'}`}>
                <input className={inputClass} value={variant.size_ml} onChange={(event) => updateVariant(index, 'size_ml', event.target.value)} placeholder="5ml" />
                <input className={inputClass} value={variant.price} onChange={(event) => updateVariant(index, 'price', event.target.value)} placeholder="Gia ban" />
                <input className={inputClass} value={variant.original_price} onChange={(event) => updateVariant(index, 'original_price', event.target.value)} placeholder="Gia goc" />
                <input className={inputClass} value={variant.stock_quantity} onChange={(event) => updateVariant(index, 'stock_quantity', event.target.value)} placeholder="Ton kho" />
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateVariant(index, 'is_default', !variant.is_default)}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${variant.is_default ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-gray-600'}`}
                  >
                    <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${variant.is_default ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'}`}>{variant.is_default && <Check size={10} className="text-white" />}</span>
                    Mac dinh
                  </button>
                  {(form.variants || []).length > 1 && <button onClick={() => removeVariant(index)} className="text-red-500 hover:text-red-600"><Trash2 size={14} /></button>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label className={labelClass + ' !mb-0'}>Specifications</label>
            <button onClick={addSpec} className={`rounded-lg px-2 py-1 text-xs ${isDark ? 'text-cyan-400 hover:bg-cyan-900/20' : 'text-blue-600 hover:bg-blue-50'}`}><Plus size={12} className="inline mr-1" />Them</button>
          </div>
          <div className="space-y-2">
            {form.specifications.map((spec, index) => (
              <div key={index} className="flex items-center gap-2">
                <input className={inputClass} value={spec.key} onChange={(event) => updateSpec(index, 'key', event.target.value)} placeholder="Truong" />
                <input className={inputClass} value={spec.value} onChange={(event) => updateSpec(index, 'value', event.target.value)} placeholder="Gia tri" />
                {form.specifications.length > 1 && <button onClick={() => removeSpec(index)} className="text-red-500 hover:text-red-600"><Trash2 size={14} /></button>}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => setField('inStock', !form.inStock)} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${form.inStock ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-gray-600'}`}>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${form.inStock ? 'border-emerald-500 bg-emerald-500' : 'border-slate-400'}`}>{form.inStock && <Check size={10} className="text-white" />}</span>
            Con hang
          </button>
          <button onClick={() => setField('isNew', !form.isNew)} className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium ${form.isNew ? 'border-violet-400 bg-violet-50 text-violet-700' : isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-gray-600'}`}>
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${form.isNew ? 'border-violet-500 bg-violet-500' : 'border-slate-400'}`}>{form.isNew && <Check size={10} className="text-white" />}</span>
            Hang moi
          </button>
        </div>

        <div>
          <label className={labelClass}>Anh dai dien</label>
          <div className="flex flex-wrap items-start gap-3">
            {(mainImagePreview || form.mainImage) ? (
              <div className="group relative inline-block">
                <img src={mainImagePreview || form.mainImage} alt="Main" className="h-20 w-20 rounded-xl border border-slate-200 object-cover" />
                <button onClick={clearMainImage} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"><X size={10} /></button>
              </div>
            ) : (
              <div className={`flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed text-[10px] ${isDark ? 'border-red-500/60 text-red-300' : 'border-red-300 text-red-500'}`}>Chua co anh</div>
            )}
            <button onClick={() => mainImgInputRef.current?.click()} className={`flex h-20 w-20 flex-col items-center justify-center rounded-xl border-2 border-dashed text-xs ${isDark ? 'border-slate-600 text-slate-400 hover:border-cyan-500' : 'border-slate-300 text-gray-500 hover:border-blue-500'}`}><Plus size={16} />Them</button>
            <input ref={mainImgInputRef} type="file" accept="image/*" className="hidden" onChange={handleMainImageSelect} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Gallery</label>
          <div className="flex flex-wrap gap-2">
            {(form.galleryImages || []).map((src, index) => (
              <div key={`${src}-${index}`} className="group relative">
                <img src={src} alt="Gallery" className="h-16 w-16 rounded-xl border border-slate-200 object-cover" />
                <button onClick={() => setField('galleryImages', (form.galleryImages || []).filter((_, itemIndex) => itemIndex !== index))} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"><X size={10} /></button>
              </div>
            ))}
            {imagePreviews.map((src, index) => (
              <div key={`${src}-${index}`} className="group relative">
                <img src={src} alt="Upload" className="h-16 w-16 rounded-xl border border-slate-200 object-cover" />
                <button onClick={() => {
                  setImageFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                  setImagePreviews((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
                }} className="absolute -right-1 -top-1 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"><X size={10} /></button>
              </div>
            ))}
            <button onClick={() => galleryImgInputRef.current?.click()} className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl border-2 border-dashed text-xs ${isDark ? 'border-slate-600 text-slate-400 hover:border-cyan-500' : 'border-slate-300 text-gray-500 hover:border-blue-500'}`}><Plus size={14} /></button>
            <input ref={galleryImgInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
          </div>
        </div>

        {error && <p className="flex items-center gap-1 text-sm text-red-500"><X size={13} />{error}</p>}
      </div>

      <div className={`flex justify-end border-t px-5 py-3 ${isDark ? 'border-slate-700/60' : 'border-slate-100'}`}>
        <button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-rose-700 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <><Loader2 size={15} className="animate-spin" />Dang xu ly...</> : <><Package size={15} />{form.id ? 'Cap nhat' : 'Tao'} san pham</>}
        </button>
      </div>
    </motion.div>
  );
}

function PerfumeListEditor({
  title,
  field,
  form,
  updateListField,
  addListField,
  removeListField,
  inputClass,
  isDark,
}: {
  title: string;
  field: keyof ProductFormData;
  form: ProductFormData;
  updateListField: (field: keyof ProductFormData, index: number, value: string) => void;
  addListField: (field: keyof ProductFormData) => void;
  removeListField: (field: keyof ProductFormData, index: number) => void;
  inputClass: string;
  isDark: boolean;
}) {
  const values = (form[field] as string[]) || [''];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{title}</label>
        <button onClick={() => addListField(field)} className={`rounded-lg px-2 py-1 text-xs ${isDark ? 'text-cyan-400 hover:bg-cyan-900/20' : 'text-blue-600 hover:bg-blue-50'}`}>
          <Plus size={12} className="mr-1 inline" />Them
        </button>
      </div>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={`${title}-${index}`} className="flex items-center gap-2">
            <input className={inputClass} value={value} onChange={(event) => updateListField(field, index, event.target.value)} placeholder={`${title} ${index + 1}`} />
            {values.length > 1 && (
              <button onClick={() => removeListField(field, index)} className="text-red-500 hover:text-red-600">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

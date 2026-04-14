import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader, Pencil, Plus, Search, Trash2, X } from 'lucide-react';

import { BrandItem, brandService } from '../services/api';

export function BrandsPage() {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandService.list();
      setBrands(data);
      setError(null);
    } catch (err) {
      console.error('Khong the tai danh sach thuong hieu:', err);
      setError('Khong the tai danh sach thuong hieu. Vui long thu lai.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(query));
  }, [brands, searchTerm]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = newBrandName.trim();
    if (!trimmedName) {
      setError('Vui long nhap ten thuong hieu.');
      return;
    }

    try {
      setSaving(true);
      const created = await brandService.create(trimmedName);
      setBrands((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name, 'vi')));
      setNewBrandName('');
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Khong the them thuong hieu.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (brand: BrandItem) => {
    setEditingBrandId(brand.id);
    setEditingName(brand.name);
    setError(null);
  };

  const cancelEditing = () => {
    setEditingBrandId(null);
    setEditingName('');
  };

  const handleUpdate = async (brandId: string) => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      setError('Vui long nhap ten thuong hieu.');
      return;
    }

    try {
      setSaving(true);
      const updated = await brandService.update(brandId, trimmedName);
      setBrands((prev) =>
        prev
          .map((brand) => (brand.id === brandId ? updated : brand))
          .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
      );
      cancelEditing();
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Khong the cap nhat thuong hieu.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (brand: BrandItem) => {
    const confirmed = window.confirm(`Xoa thuong hieu "${brand.name}"?`);
    if (!confirmed) return;

    try {
      setSaving(true);
      await brandService.remove(brand.id);
      setBrands((prev) => prev.filter((item) => item.id !== brand.id));
      if (editingBrandId === brand.id) {
        cancelEditing();
      }
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Khong the xoa thuong hieu.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Quan ly thuong hieu</h1>
          <p className="mt-2 text-gray-600">Them, sua va xoa brand de web admin co the nhap san pham thu cong.</p>
        </div>

        <form onSubmit={handleCreate} className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={newBrandName}
            onChange={(event) => setNewBrandName(event.target.value)}
            placeholder="Nhap ten thuong hieu moi, vi du Dolce & Gabbana"
            className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
            disabled={saving}
          />
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus size={18} />
            Them brand
          </button>
        </form>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tim thuong hieu..."
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-600">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-600">
          <Loader className="mr-2 h-6 w-6 animate-spin text-blue-600" />
          Dang tai thuong hieu...
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Danh sach brand</h2>
              <p className="text-sm text-gray-500">{filteredBrands.length} thuong hieu</p>
            </div>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="py-16 text-center text-gray-500">Khong tim thay thuong hieu nao phu hop.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredBrands.map((brand) => {
                const isEditing = editingBrandId === brand.id;

                return (
                  <div key={brand.id} className="flex flex-col gap-4 px-6 py-4 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          className="w-full rounded-xl border border-blue-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
                          disabled={saving}
                        />
                      ) : (
                        <>
                          <p className="text-base font-medium text-gray-900">{brand.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">ID: {brand.id}</p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdate(brand.id)}
                            disabled={saving}
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Luu
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <X size={16} />
                            Huy
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(brand)}
                          disabled={saving}
                          className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Pencil size={16} />
                          Sua
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(brand)}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={16} />
                        Xoa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

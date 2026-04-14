import type { Customer, CheckoutPayload, Order, Review, SellerResponse } from '../types/account';
import type { ApiProduct, ApiVariant, UiProduct } from '../types/perfume';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/+$/, '');

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return value;
  }
  if (!value) {
    return 0;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatNotePreview(product: ApiProduct): string {
  const notes =
    product.detail?.top_notes?.slice(0, 2) ||
    product.mood_traits?.slice(0, 2) ||
    [];
  return notes.join(' • ');
}

function buildTags(product: ApiProduct): string[] {
  const tags = [...(product.tags || [])];

  if (product.isNew && !tags.includes('Mới')) {
    tags.unshift('Mới');
  }

  if (product.is_best_seller && !tags.includes('Best Seller')) {
    tags.unshift('Best Seller');
  }

  const genderLabel =
    product.target_gender === 'female'
      ? 'Nữ'
      : product.target_gender === 'male'
        ? 'Nam'
        : 'Unisex';

  if (!tags.includes(genderLabel)) {
    tags.push(genderLabel);
  }

  return Array.from(new Set(tags));
}

export function mapProduct(product: ApiProduct): UiProduct {
  const variants = product.detail?.variants || (product.default_variant ? [product.default_variant] : []);
  const defaultVariant =
    variants.find((variant) => variant.is_default) ||
    product.default_variant ||
    variants[0] ||
    null;
  const hasVariantStock = variants.length ? variants.some((variant) => (variant.is_active ?? true) && toNumber(variant.stock_quantity) > 0) : null;
  const computedInStock = hasVariantStock ?? Boolean(product.detail?.inStock ?? true);

  return {
    id: product.id || product.slug || product.name,
    slug: product.slug || product.id,
    name: product.name,
    brand: product.brand,
    gender: product.target_gender,
    family: product.olfactory_family || 'Hiện đại',
    image: product.main_image || product.image,
    gallery: product.detail?.images?.length ? product.detail.images : [product.main_image || product.image],
    price: toNumber(defaultVariant?.price ?? product.price),
    originalPrice: defaultVariant?.original_price ? toNumber(defaultVariant.original_price) : toNumber(product.originalPrice),
    notes: formatNotePreview(product),
    description: product.short_description || product.detail?.description || '',
    subtitle: product.detail?.subtitle || `${product.brand} • ${product.olfactory_family || 'Nước hoa chiết'}`,
    story: product.detail?.story || '',
    moodTraits: product.mood_traits || [],
    tags: buildTags(product),
    topNotes: product.detail?.top_notes || [],
    heartNotes: product.detail?.heart_notes || [],
    baseNotes: product.detail?.base_notes || [],
    season: product.detail?.season || [],
    occasion: product.detail?.occasion || [],
    longevity: product.detail?.longevity || '5-7 giờ',
    sillage: product.detail?.sillage || 'Vừa',
    inStock: computedInStock,
    variants,
    detail: product.detail,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const response = await fetch(`${API_URL}${normalizedPath}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!response.ok) {
    let message = `API request failed: ${response.status}`;
    try {
      const data = await response.json();
      message = data.error || data.message || JSON.stringify(data);
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export async function fetchProducts(): Promise<UiProduct[]> {
  const data = await request<ApiProduct[]>('/products/');
  return data.map(mapProduct);
}

export async function fetchProductById(productId: string): Promise<UiProduct> {
  const data = await request<ApiProduct>(`/products/${productId}/`);
  return mapProduct(data);
}

export function variantLabel(variant: ApiVariant): string {
  return `${variant.size_ml}ml`;
}

export interface GiftSetItem {
  product_id: string;
  variant_size_ml?: number | null;
  quantity: number;
  bonus_gift?: string;
  product?: {
    id: string;
    slug: string;
    name: string;
    brand: string;
    image: string;
    short_description?: string;
  } | null;
  variant?: {
    size_ml: number;
    price: number;
    stock_quantity: number;
  } | null;
  unit_price: number;
  line_total: number;
  in_stock: boolean;
}

export interface GiftSet {
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
  items: GiftSetItem[];
  total_price: number;
  product_count: number;
  has_stock_issues: boolean;
}

export async function fetchGiftSets() {
  return request<GiftSet[]>('/gift-sets/?active=true');
}

export async function loginCustomer(email: string, password: string) {
  return request<{ message: string; id: string; role: string }>('/customer/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function loginCustomerWithGoogle(credential: string) {
  return request<{ message: string; id: string; role: string }>('/customer/google-login/', {
    method: 'POST',
    body: JSON.stringify({ credential }),
  });
}

export async function registerCustomer(payload: {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal_code: string;
}) {
  return request<{ message: string; id: string }>('/customer/register/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logoutCustomer() {
  return request<{ message: string }>('/customer/logout/', {
    method: 'POST',
  });
}

export async function fetchSessionCustomer() {
  return request<Customer>('/customer/session/');
}

export async function fetchCustomer(customerId: string) {
  return request<Customer>(`/customer/get_customer/${customerId}/`);
}

export async function updateCustomer(customerId: string, payload: Partial<Customer>) {
  return request<{ message: string; customer: Customer }>(`/customer/up_date/${customerId}/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function fetchOrdersByCustomer(customerId: string) {
  return request<Order[]>(`/order/customer/${customerId}/`);
}

export async function createOrder(payload: CheckoutPayload) {
  return request<Order>('/order/create/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchReviewsByProduct(productId: string) {
  return request<Review[]>(`/review/get_by_id/${productId}/`);
}

export async function createReview(payload: {
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string;
}) {
  return request<Review>('/review/add/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchSellerResponsesByReview(reviewId: string) {
  return request<SellerResponse[]>(`/review/${reviewId}/responses/`);
}

export async function createMomoPayment(orderId: string) {
  return request<{ payUrl: string; deeplink?: string; qrCodeUrl?: string; message?: string }>('/order/momo/create-payment/', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
}

export async function confirmMomoPayment(payload: Record<string, string>) {
  return request<{ payment_status: string }>('/order/momo/confirm-payment/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function createVnpayPayment(orderId: string) {
  return request<{ payUrl: string; txnRef: string; amount: number; message?: string }>('/order/vnpay/create-payment/', {
    method: 'POST',
    body: JSON.stringify({ order_id: orderId }),
  });
}

export async function confirmVnpayPayment(payload: Record<string, string>) {
  return request<{ order_id: string; payment_status: string; response_code: string; transaction_status: string }>('/order/vnpay/confirm-payment/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

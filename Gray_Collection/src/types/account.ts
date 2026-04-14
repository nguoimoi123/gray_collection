export interface Customer {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

export interface OrderItem {
  product: string;
  product_id: string;
  product_name?: string;
  product_image?: string;
  variant_size_ml?: number | null;
  variant_label?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customer: Customer | string;
  items: OrderItem[];
  total_price: number;
  status: string;
  payment_method: string;
  payment_status?: string;
  shipping_address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  created_at: string;
}

export interface CheckoutPayload {
  customer: string;
  items: Array<{
    product_id: string;
    quantity: number;
    variant_size_ml?: number;
  }>;
  shipping_address: string;
  city: string;
  province: string;
  postal_code: string;
  phone: string;
  payment_method: 'cod' | 'momo' | 'vnpay';
}

export interface Review {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar: string;
}

export interface SellerResponse {
  id: string;
  review_id: string;
  response: string;
  admin_id: string;
  admin_name: string;
  created_at: string;
  updated_at: string;
  response_type: 'manual' | 'ai';
}

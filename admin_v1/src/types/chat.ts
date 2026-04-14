import { ChartData } from '../components/chat/ChatChart';
import { OrderData } from '../components/chat/OrderApprovalCard';

export interface ProductVariantFormData {
  size_ml: string;
  price: string;
  original_price?: string;
  stock_quantity: string;
  sku?: string;
  is_default?: boolean;
}

export interface ProductFormData {
  id?: string;
  name: string;
  slug?: string;
  price: string;
  originalPrice: string;
  category: string;
  brand: string;
  description: string;
  short_description?: string;
  subtitle?: string;
  story?: string;
  target_gender?: 'female' | 'male' | 'unisex';
  olfactory_family?: string;
  mood_traits?: string[];
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  season?: string[];
  occasion?: string[];
  longevity?: string;
  sillage?: string;
  tags?: string[];
  features: string[];
  specifications: { key: string; value: string }[];
  variants?: ProductVariantFormData[];
  isNew: boolean;
  inStock: boolean;
  mainImage?: string;
  galleryImages?: string[];
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  images?: string[];
  type?: 'chat' | 'product_form' | 'chart' | 'order_approval';
  formPrefill?: Partial<ProductFormData>;
  chartData?: ChartData;
  orderApprovalData?: OrderData[];
}

export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatbotResponse {
  action: 'show_order_approval' | 'show_product_form' | 'draw_chart' | 'general_chat' | 'statistics' | 'navigate' | string;
  answer?: string;
  message?: string;
  orders?: OrderData[];
  prefill?: Partial<ProductFormData>;
  title?: string;
  type?: string;
  data?: any[];
  xAxisKey?: string;
  dataKeys?: string[];
  payload?: {
    path: string;
  };
  success?: boolean;
  error?: string;
}

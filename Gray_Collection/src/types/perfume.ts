export interface ApiVariant {
  id?: string;
  size_ml: number;
  price: string | number;
  original_price?: string | number | null;
  stock_quantity: number;
  sku?: string;
  is_default: boolean;
  is_active?: boolean;
}

export interface ApiProductDetail {
  subtitle?: string;
  story?: string;
  description?: string;
  images?: string[];
  top_notes?: string[];
  heart_notes?: string[];
  base_notes?: string[];
  season?: string[];
  occasion?: string[];
  longevity?: string;
  sillage?: string;
  inStock?: boolean;
  reviewCount?: number;
  variants?: ApiVariant[];
}

export interface ApiProduct {
  id: string;
  name: string;
  slug?: string;
  brand: string;
  category: string;
  image: string;
  main_image?: string;
  price: string | number;
  originalPrice?: string | number | null;
  rating?: number;
  isNew?: boolean;
  target_gender: 'female' | 'male' | 'unisex';
  olfactory_family?: string;
  mood_traits?: string[];
  short_description?: string;
  is_best_seller?: boolean;
  tags?: string[];
  default_variant?: ApiVariant | null;
  detail?: ApiProductDetail;
}

export interface UiProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  gender: 'female' | 'male' | 'unisex';
  family: string;
  image: string;
  gallery: string[];
  price: number;
  originalPrice?: number | null;
  notes: string;
  description: string;
  subtitle: string;
  story: string;
  moodTraits: string[];
  tags: string[];
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  season: string[];
  occasion: string[];
  longevity: string;
  sillage: string;
  inStock: boolean;
  variants: ApiVariant[];
  detail?: ApiProductDetail;
}

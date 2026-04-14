import React from 'react';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { useWishlist } from '../context/WishlistContext';
import type { UiProduct } from '../types/perfume';

interface ProductCardProps {
  id: string;
  productId?: string;
  name: string;
  price: number;
  image: string;
  brand?: string;
  family?: string;
  notes?: string;
  description?: string;
  tags?: string[];
}

export function ProductCard({ id, productId, name, price, image, brand, family, notes, description, tags }: ProductCardProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const stableId = productId || id;

  const product: UiProduct = {
    id: stableId,
    slug: id,
    name,
    brand: brand || '',
    gender: 'unisex',
    family: family || '',
    image,
    gallery: [image],
    price,
    originalPrice: null,
    notes: notes || '',
    description: description || '',
    subtitle: '',
    story: '',
    moodTraits: [],
    tags: tags || [],
    topNotes: [],
    heartNotes: [],
    baseNotes: [],
    season: [],
    occasion: [],
    longevity: '',
    sillage: '',
    inStock: true,
    variants: [],
  };

  const liked = isWishlisted(stableId);

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ duration: 0.3 }} className="group flex h-full flex-col">
      <Link to={`/product/${id}`} className="relative mb-6 block aspect-[4/5] overflow-hidden bg-brand-light">
        <img src={image} alt={name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />

        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur transition-colors ${
            liked ? 'bg-rose-500 text-white' : 'bg-white/90 text-brand-dark hover:bg-rose-50'
          }`}
        >
          <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
        </button>

        {tags && tags.length > 0 && (
          <div className="absolute left-4 top-4 flex max-w-[70%] flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        )}
      </Link>

      <div className="mb-2 flex items-start justify-between gap-4">
        <Link to={`/product/${id}`}>
          <h3 className="font-serif text-2xl italic transition-colors group-hover:text-sage-600">{name}</h3>
        </Link>
        <span className="text-brand-gray">{price.toLocaleString('vi-VN')}đ</span>
      </div>

      {(brand || family) && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-brand-gray">{[brand, family].filter(Boolean).join(' - ')}</p>}

      {notes && <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-gray">Gợi ý note: {notes}</p>}

      {description && <p className="flex-1 text-sm leading-relaxed text-brand-gray">{description}</p>}
    </motion.div>
  );
}

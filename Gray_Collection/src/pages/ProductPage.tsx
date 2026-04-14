import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { createReview, fetchProductById, fetchProducts, fetchReviewsByProduct, fetchSellerResponsesByReview, variantLabel } from '../services/api';
import type { Review, SellerResponse } from '../types/account';
import type { UiProduct } from '../types/perfume';

function StarRating({ rating, onSelect }: { rating: number; onSelect?: (value: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onSelect?.(value)}
          className={`text-xl transition-colors ${value <= rating ? 'text-amber-400' : 'text-gray-300'} ${onSelect ? 'hover:text-amber-500' : 'cursor-default'}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ProductPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { customerId, isAuthenticated } = useAuth();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [product, setProduct] = useState<UiProduct | null>(null);
  const [catalog, setCatalog] = useState<UiProduct[]>([]);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sellerResponses, setSellerResponses] = useState<Record<string, SellerResponse[]>>({});
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMessage, setReviewMessage] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('Không tìm thấy sản phẩm.');
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError('');

    Promise.all([fetchProductById(id), fetchProducts()])
      .then(([productData, catalogData]) => {
        if (!active) return;
        setProduct(productData);
        setCatalog(catalogData);
        setSelectedSize(productData.variants.find((variant) => variant.is_default)?.size_ml || productData.variants[0]?.size_ml || null);
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : 'Không thể tải chi tiết sản phẩm.');
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    if (!product?.id) return;
    fetchReviewsByProduct(product.id).then(setReviews).catch(() => setReviews([]));
  }, [product?.id]);

  useEffect(() => {
    let active = true;

    const loadResponses = async () => {
      if (!reviews.length) {
        setSellerResponses({});
        return;
      }

      const entries = await Promise.all(
        reviews.map(async (review) => {
          try {
            const responses = await fetchSellerResponsesByReview(review.id);
            return [review.id, responses] as const;
          } catch {
            return [review.id, []] as const;
          }
        })
      );

      if (active) {
        setSellerResponses(Object.fromEntries(entries));
      }
    };

    loadResponses();

    return () => {
      active = false;
    };
  }, [reviews]);

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((variant) => variant.size_ml === selectedSize) || product.variants[0] || null;
  }, [product, selectedSize]);

  const similarProducts = useMemo(() => {
    if (!product) return [];
    return catalog.filter((item) => item.id !== product.id && (item.family === product.family || item.brand === product.brand)).slice(0, 3);
  }, [catalog, product]);

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addToCart({
      productId: product.id,
      variantSizeMl: selectedVariant.size_ml,
      name: product.name,
      type: `Nước hoa chiết / ${variantLabel(selectedVariant)}`,
      price: Number(selectedVariant.price),
      image: product.image,
      description: product.description,
    });
  };

  const handleSubmitReview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewMessage('');
    if (!product || !customerId) return setReviewMessage('Bạn cần đăng nhập để gửi đánh giá.');
    if (!reviewComment.trim()) return setReviewMessage('Vui lòng nhập nội dung đánh giá.');

    setIsSubmittingReview(true);
    try {
      const review = await createReview({
        product_id: product.id,
        customer_id: customerId,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviews((prev) => [review, ...prev]);
      setReviewComment('');
      setReviewRating(5);
      setReviewMessage('Đánh giá của bạn đã được gửi.');
    } catch (err) {
      setReviewMessage(err instanceof Error ? err.message : 'Không thể gửi đánh giá.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-24 pt-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
          <div className="animate-pulse">
            <div className="aspect-[4/5] bg-sage-100" />
          </div>
          <div className="animate-pulse space-y-6 lg:pt-12">
            <div className="h-4 w-40 bg-sage-100" />
            <div className="h-12 w-2/3 bg-sage-100" />
            <div className="h-6 w-1/2 bg-sage-100" />
            <div className="h-28 w-full bg-sage-100" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return <div className="min-h-screen px-6 pt-20 text-red-500">{error || 'Không tìm thấy sản phẩm.'}</div>;
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 pb-24 pt-12 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="aspect-[4/5] overflow-hidden bg-brand-light">
            <img src={product.gallery[0] || product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {product.gallery.slice(0, 3).map((image, index) => (
              <div key={`${image}-${index}`} className="aspect-square overflow-hidden bg-brand-light">
                <img src={image} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        <div className="lg:pt-12">
          <div className="mb-6 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-sage-300" />
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray">
              {product.brand} - {product.family}
            </p>
          </div>

          <h1 className="mb-2 text-5xl font-sans font-medium">{product.name}</h1>
          <p className="mb-6 text-xl font-serif italic text-brand-gray">{product.subtitle}</p>

          <div className="mb-8 flex items-center gap-4">
            <p className="text-2xl">{(selectedVariant ? Number(selectedVariant.price) : product.price).toLocaleString('vi-VN')}đ</p>
            <div className="flex items-center gap-3">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-sm text-brand-gray">{reviews.length} đánh giá</span>
            </div>
          </div>

          {selectedVariant?.original_price && Number(selectedVariant.original_price) > Number(selectedVariant.price) && (
            <p className="mb-8 text-brand-gray line-through">{Number(selectedVariant.original_price).toLocaleString('vi-VN')}đ</p>
          )}

          <p className="mb-10 text-brand-gray leading-relaxed">{product.description}</p>

          <div className="mb-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray">Chọn dung tích chiết</p>
            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant) => (
                <button
                  key={variant.size_ml}
                  type="button"
                  onClick={() => setSelectedSize(variant.size_ml)}
                  className={`border px-4 py-3 text-sm transition-colors ${
                    selectedSize === variant.size_ml ? 'border-sage-600 bg-sage-50 text-sage-700' : 'border-gray-200 hover:border-sage-400'
                  }`}
                >
                  {variantLabel(variant)} - {Number(variant.price).toLocaleString('vi-VN')}đ
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="mb-4 w-full bg-sage-600 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {product.inStock ? 'Thêm vào giỏ' : 'Tạm hết hàng'}
          </button>

          <button
            type="button"
            onClick={() => toggleWishlist(product)}
            className={`mb-8 w-full border py-4 text-xs font-bold uppercase tracking-[0.25em] transition-colors ${
              isWishlisted(product.id) ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-gray-200 text-brand-dark hover:border-sage-400'
            }`}
          >
            {isWishlisted(product.id) ? 'Đã lưu vào danh sách yêu thích' : 'Lưu vào danh sách yêu thích'}
          </button>

          <div className="mb-16 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.25em] text-brand-gray">
            <span className="text-mint-400">■</span> {product.inStock ? 'Còn hàng' : 'Tạm hết hàng'} - {product.longevity} - Tỏa hương {product.sillage}
          </div>

          <div>
            <h3 className="mb-6 text-[10px] font-bold uppercase tracking-[0.25em]">Cấu trúc mùi hương</h3>
            <div className="space-y-0">
              <NoteRow label="Hương đầu" value={product.topNotes.join(', ') || 'Đang cập nhật'} />
              <NoteRow label="Hương giữa" value={product.heartNotes.join(', ') || 'Đang cập nhật'} />
              <NoteRow label="Hương cuối" value={product.baseNotes.join(', ') || 'Đang cập nhật'} />
              <NoteRow label="Tính chất" value={product.moodTraits.join(', ') || 'Đang cập nhật'} />
              <NoteRow label="Phù hợp" value={product.occasion.join(', ') || 'Dùng hằng ngày'} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 border-t border-gray-100 px-6 py-24 md:grid-cols-2">
        <div className="relative bg-sage-50 p-12 md:p-20">
          <div className="absolute left-0 top-0 h-16 w-1 bg-mint-300" />
          <h2 className="mb-8 text-4xl font-sans font-medium">
            Câu chuyện của
            <br />
            mùi hương
          </h2>
          <div className="space-y-6 text-sm leading-relaxed text-brand-gray">
            <p>{product.detail?.story || product.description}</p>
            <p>
              Phù hợp cho {product.occasion.join(', ').toLowerCase() || 'dùng hằng ngày'} và đẹp nhất vào {product.season.join(', ').toLowerCase() || 'quanh năm'}.
            </p>
          </div>
        </div>
        <div className="aspect-square">
          <img src={product.gallery[1] || product.gallery[0] || product.image} alt={product.name} className="h-full w-full object-cover" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <section>
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-serif">Đánh giá từ khách hàng</h2>
                <p className="mt-2 text-sm text-brand-gray">{reviews.length ? `${averageRating.toFixed(1)}/5 từ ${reviews.length} đánh giá` : 'Chưa có đánh giá nào cho mùi hương này.'}</p>
              </div>
              <StarRating rating={Math.round(averageRating)} />
            </div>

            <div className="space-y-5">
              {reviews.length ? (
                reviews.map((review) => (
                  <article key={review.id} className="rounded-[1.5rem] border border-gray-100 p-6">
                    <div className="mb-4 flex items-center gap-4">
                      <img src={review.user_avatar} alt={review.user_name} className="h-12 w-12 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-brand-dark">{review.user_name || 'Khách hàng'}</p>
                        <p className="text-sm text-brand-gray">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="mb-3">
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="text-sm leading-7 text-brand-gray">{review.comment}</p>
                    {!!sellerResponses[review.id]?.length && (
                      <div className="mt-5 space-y-3 border-t border-sage-100 pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-700">Phản hồi từ người bán</p>
                        {sellerResponses[review.id].map((response) => (
                          <div
                            key={response.id}
                            className={`rounded-2xl px-4 py-4 text-sm leading-7 ${
                              response.response_type === 'ai'
                                ? 'bg-emerald-50 text-emerald-900'
                                : 'bg-sage-50 text-brand-dark'
                            }`}
                          >
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-sage-700">
                              {response.response_type === 'ai' ? 'AI Assistant' : response.admin_name || 'Người bán'}
                            </p>
                            <p>{response.response}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-gray-100 p-8 text-brand-gray">Hãy trở thành người đầu tiên chia sẻ trải nghiệm về mùi hương này.</div>
              )}
            </div>
          </section>

          <aside className="space-y-8">
            <div className="rounded-[1.75rem] border border-sage-100 bg-sage-50/40 p-8">
              <h3 className="mb-4 text-xl font-serif">Viết đánh giá</h3>
              {!isAuthenticated ? (
                <p className="text-sm leading-7 text-brand-gray">
                  Bạn cần <Link to="/login" className="font-medium text-sage-700">đăng nhập</Link> để gửi nhận xét về sản phẩm.
                </p>
              ) : (
                <form className="space-y-4" onSubmit={handleSubmitReview}>
                  <div>
                    <p className="mb-2 text-sm text-brand-gray">Đánh giá của bạn</p>
                    <StarRating rating={reviewRating} onSelect={setReviewRating} />
                  </div>
                  <textarea
                    value={reviewComment}
                    onChange={(event) => setReviewComment(event.target.value)}
                    rows={5}
                    placeholder="Chia sẻ cảm nhận của bạn về mùi hương, độ lưu hương, độ tỏa hương..."
                    className="w-full rounded-3xl border border-sage-100 bg-white px-4 py-4 text-sm focus:border-sage-400 focus:outline-none"
                  />
                  {reviewMessage && <p className="text-sm text-brand-gray">{reviewMessage}</p>}
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-sage-600 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700 disabled:opacity-70"
                  >
                    {isSubmittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                  </button>
                </form>
              )}
            </div>

            {!!similarProducts.length && (
              <div className="rounded-[1.75rem] border border-gray-100 p-8">
                <h3 className="mb-5 text-xl font-serif">Gợi ý cùng vibe</h3>
                <div className="space-y-4">
                  {similarProducts.map((item) => (
                    <Link key={item.id} to={`/product/${item.slug}`} className="flex items-center gap-4 rounded-2xl p-2 transition-colors hover:bg-sage-50">
                      <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover" />
                      <div>
                        <p className="font-medium text-brand-dark">{item.name}</p>
                        <p className="text-sm text-brand-gray">{item.brand} - {item.family}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function NoteRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-200 py-4">
      <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray">{label}</span>
      <span className="max-w-[60%] text-right font-serif italic text-brand-gray">{value}</span>
    </div>
  );
}

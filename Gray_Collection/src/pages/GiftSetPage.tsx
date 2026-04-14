import React, { useEffect, useState } from 'react';
import { CreditCard, Gift, Loader2, ShoppingBag, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext';
import { fetchGiftSets, type GiftSet } from '../services/api';

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + 'đ';
}

export function GiftSetPage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [giftSets, setGiftSets] = useState<GiftSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    fetchGiftSets()
      .then((data) => {
        if (mounted) {
          setGiftSets(data || []);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Chưa tải được gift set. Bạn thử lại sau nhé.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const pushGiftSetToCart = (giftSet: GiftSet) => {
    giftSet.items.forEach((item) => {
      if (!item.product || !item.variant_size_ml) {
        return;
      }

      for (let index = 0; index < item.quantity; index += 1) {
        addToCart({
          productId: item.product.id,
          variantSizeMl: item.variant_size_ml,
          name: item.product.name,
          type: `Gift Set • ${item.variant_size_ml}ml`,
          price: item.unit_price,
          image: item.product.image,
          description: giftSet.title,
        });
      }
    });
  };

  const handleAddGiftSet = (giftSet: GiftSet) => {
    setSubmittingId(giftSet.id);
    pushGiftSetToCart(giftSet);
    window.setTimeout(() => setSubmittingId(null), 500);
  };

  const handleCheckoutGiftSet = (giftSet: GiftSet) => {
    setSubmittingId(giftSet.id);
    pushGiftSetToCart(giftSet);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-[#f7f2e8] px-6 pb-24 pt-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 grid gap-6 rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.95),_rgba(235,225,208,0.92))] px-8 py-10 shadow-[0_20px_80px_rgba(78,55,28,0.08)] md:grid-cols-[1.3fr_0.7fr] md:px-12">
          <div>
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#8f6d46]">Gift Set</p>
            <h1 className="mb-4 font-serif text-5xl italic text-[#2d2418]">Quà tặng theo dịp, lễ và chiến dịch shop muốn đẩy</h1>
            <p className="max-w-2xl text-lg leading-relaxed text-[#685845]">
              Đây là khu vực dành cho những set quà được shop chọn sẵn. Bạn có thể gom nhiều mùi hương, chọn dung tích phù hợp và thêm quà tặng kèm để khách chốt nhanh hơn.
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-white/70 bg-white/70 p-6 backdrop-blur">
            <div className="mb-4 inline-flex rounded-full bg-[#f1e2c7] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#8a6030]">
              Chọn quà dễ hơn
            </div>
            <div className="space-y-3 text-sm leading-7 text-[#554532]">
              <p>Phù hợp để tặng sinh nhật, kỷ niệm, dịp lễ hoặc gửi tặng người bạn quan tâm.</p>
              <p>Mỗi set đã được phối sẵn mùi hương và dung tích để dễ chọn, tiết kiệm thời gian hơn khi mua quà.</p>
              <p>Bạn có thể thêm toàn bộ set vào giỏ chỉ với một lần bấm và thanh toán ngay như các sản phẩm thông thường.</p>
            </div>
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-16 text-[#6f5a43]">
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
            Đang tải gift set...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-[1.5rem] border border-[#e3d3bc] bg-white px-8 py-10 text-center text-[#8b5a47]">
            {error}
          </div>
        )}

        {!loading && !error && !giftSets.length && (
          <div className="rounded-[1.5rem] border border-dashed border-[#d8c5aa] bg-white/70 px-8 py-14 text-center">
            <p className="mb-4 text-lg text-[#5f4c37]">Hiện shop chưa tạo gift set nào.</p>
            <Link to="/collection" className="inline-flex items-center gap-2 rounded-full bg-[#2f3f31] px-6 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white">
              Khám phá bộ sưu tập
            </Link>
          </div>
        )}

        {!loading && !error && giftSets.length > 0 && (
          <div className="grid gap-8 lg:grid-cols-2">
            {giftSets.map((giftSet) => (
              <article key={giftSet.id} className="overflow-hidden rounded-[2rem] border border-[#e5d6c1] bg-white shadow-[0_18px_48px_rgba(71,52,31,0.08)]">
                <div className="relative h-64 overflow-hidden bg-[#efe6d8]">
                  {giftSet.cover_image ? (
                    <img src={giftSet.cover_image} alt={giftSet.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#efe0c4,#f7f3ea)] text-[#7b6548]">
                      <Gift className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute left-5 top-5 flex flex-wrap gap-2">
                    {giftSet.occasion_label ? (
                      <span className="rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#7f5d38]">
                        {giftSet.occasion_label}
                      </span>
                    ) : null}
                    {giftSet.campaign_label ? (
                      <span className="rounded-full bg-[#2f3f31] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                        {giftSet.campaign_label}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-6 p-7">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-4xl italic text-[#2d2418]">{giftSet.title}</h2>
                      <p className="mt-2 text-sm leading-7 text-[#685845]">
                        {giftSet.description || 'Một set quà được dựng sẵn để khách chọn nhanh theo dịp.'}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] bg-[#f8f3eb] px-4 py-3 text-right">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9c7b57]">Tạm tính</p>
                      <p className="mt-1 text-lg font-semibold text-[#2d2418]">{formatPrice(giftSet.total_price)}</p>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {giftSet.items.map((item, index) => (
                      <div key={`${giftSet.id}-${item.product_id}-${index}`} className="flex items-center justify-between rounded-[1.25rem] border border-[#eee3d4] bg-[#fffdf9] px-4 py-4">
                        <div>
                          <p className="font-medium text-[#2d2418]">{item.product?.name || 'Sản phẩm đã ẩn'}</p>
                          <p className="text-sm text-[#6f5b45]">
                            {item.product?.brand || 'Gray Collection'} • {item.variant_size_ml || item.variant?.size_ml || 0}ml • SL {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-[#2d2418]">{formatPrice(item.line_total)}</p>
                          <p className={`text-xs ${item.in_stock ? 'text-emerald-600' : 'text-red-500'}`}>
                            {item.in_stock ? 'Sẵn để lên set' : 'Đang thiếu hàng'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 rounded-[1.4rem] bg-[#fbf6ef] p-5 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9c7b57]">Quà tặng kèm</p>
                      <p className="text-sm leading-7 text-[#5f4c37]">{giftSet.bonus_gift || 'Chưa cài quà tặng kèm cho set này.'}</p>
                    </div>
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#9c7b57]">Ghi chú</p>
                      <p className="text-sm leading-7 text-[#5f4c37]">{giftSet.gift_note || 'Có thể thêm thiệp, lời nhắn hoặc concept đóng gói riêng.'}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.6rem] border border-[#ead9c4] bg-[linear-gradient(135deg,#fff9f0,#f6ecdd)] p-5">
                    <div className="mb-4 flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#9c7b57]">Thẻ thanh toán</p>
                        <p className="mt-2 text-sm leading-7 text-[#5b4935]">
                          Gồm {giftSet.product_count} món, tổng thanh toán tạm tính {formatPrice(giftSet.total_price)}.
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/80 p-3 text-[#6e5435]">
                        <CreditCard className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => handleAddGiftSet(giftSet)}
                        disabled={submittingId === giftSet.id || giftSet.has_stock_issues}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[#bda27d] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#6a502e] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        {submittingId === giftSet.id ? 'Dang them...' : 'Them ca set vao gio'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCheckoutGiftSet(giftSet)}
                        disabled={submittingId === giftSet.id || giftSet.has_stock_issues}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#2f3f31] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition hover:bg-[#243226] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CreditCard className="h-4 w-4" />
                        Thanh toan ngay
                      </button>
                    </div>
                  </div>

                  {giftSet.has_stock_issues && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-xs font-medium text-amber-800">
                      <Sparkles className="h-4 w-4" />
                      Set này đang có món thiếu hàng, bạn có thể chỉnh lại bên admin.
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

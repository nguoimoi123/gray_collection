import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';

export function CartPage() {
  const { items, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen bg-sage-50/30 pt-12 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <h1 className="text-5xl font-sans font-medium mb-4">Giỏ Hàng Của Bạn</h1>
          <p className="text-brand-gray text-lg">Những mùi hương bạn đã chọn đang chờ được lên đơn.</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="flex-1">
            {items.length === 0 ? (
              <div className="py-12 border-t border-gray-200">
                <p className="text-brand-gray mb-6">Giỏ hàng của bạn hiện đang trống.</p>
                <Link to="/collection" className="text-[10px] font-bold tracking-widest uppercase border-b border-brand-dark pb-1">
                  Khám phá bộ sưu tập
                </Link>
              </div>
            ) : (
              <div className="space-y-12">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-8 border-b border-gray-200 pb-12"
                  >
                    <div className="w-40 aspect-[4/5] bg-brand-light flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-2xl font-sans font-medium">{item.name}</h3>
                          <span className="font-medium">{item.price.toLocaleString('vi-VN')}đ</span>
                        </div>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-brand-gray mb-4">{item.type}</p>
                        <p className="text-sm text-brand-gray max-w-md line-clamp-2">
                          {item.description || 'Nước hoa chiết tiện mang theo hằng ngày và phù hợp để test mùi trước khi mua chai lớn.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-8 mt-6">
                        <div className="flex items-center border-b border-gray-300 pb-1">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-brand-gray hover:text-brand-dark px-2">
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity < 10 ? `0${item.quantity}` : item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-brand-gray hover:text-brand-dark px-2">
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] font-bold tracking-widest uppercase text-brand-gray hover:text-red-500 transition-colors flex items-center gap-1"
                        >
                          <span>×</span> Xóa
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-sage-50/50 p-8 sticky top-28 border-t-4 border-mint-300">
              <h2 className="text-2xl font-sans font-medium mb-8">Tóm Tắt Đơn</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray">Tạm tính</span>
                  <span className="font-medium">{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-gray">Phí vận chuyển</span>
                  <span className="italic text-brand-gray">Tính ở bước tiếp theo</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-brand-gray">Quà tặng kèm</span>
                  <span className="bg-mint-100 text-mint-700 text-[9px] font-bold tracking-widest uppercase px-2 py-1">Có sẵn</span>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xl font-sans font-medium">Tổng cộng</span>
                  <span className="text-3xl font-sans font-medium text-sage-700">{cartTotal.toLocaleString('vi-VN')}đ</span>
                </div>
                <p className="text-right text-[10px] font-bold tracking-widest uppercase text-brand-gray">Đã gồm VAT</p>
              </div>

              <Link
                to="/checkout"
                className="block w-full bg-sage-600 hover:bg-sage-700 text-white text-center py-4 text-[10px] font-bold tracking-widest uppercase transition-colors mb-4"
              >
                Tiếp tục thanh toán
              </Link>

              <p className="text-[10px] text-center text-brand-gray mb-12">
                Khi đặt hàng, bạn đồng ý với <a href="#" className="underline">Điều khoản dịch vụ</a> và{' '}
                <a href="#" className="underline">Chính sách riêng tư</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

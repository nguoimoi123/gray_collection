import React from 'react';
import { Link, useLocation } from 'react-router-dom';

type SuccessState = {
  orderId?: string;
  paymentMethod?: string;
  title?: string;
  message?: string;
};

export function OrderSuccessPage() {
  const location = useLocation();
  const state = (location.state || {}) as SuccessState;

  const title = state.title || 'Đơn hàng của bạn đã được ghi nhận';
  const message = state.message || 'Gray Collection đã nhận được thông tin đơn hàng. Chúng tôi sẽ liên hệ và cập nhật trạng thái sớm nhất.';

  return (
    <div className="min-h-screen bg-[#f7f4ee] px-6 py-20">
      <div className="mx-auto max-w-3xl rounded-[2rem] border border-sage-100 bg-white px-8 py-14 text-center shadow-sm md:px-14">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-sage-600">Gray Collection</p>
        <h1 className="mb-5 font-serif text-4xl text-brand-dark md:text-5xl">{title}</h1>
        <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-brand-gray">{message}</p>

        {state.orderId && (
          <div className="mx-auto mb-8 max-w-md rounded-2xl bg-sage-50 px-6 py-5 text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray">Thông tin đơn hàng</p>
            <p className="mt-3 text-base font-medium text-brand-dark">Mã đơn: {state.orderId}</p>
            {state.paymentMethod && <p className="mt-1 text-sm text-brand-gray">Phương thức thanh toán: {state.paymentMethod.toUpperCase()}</p>}
          </div>
        )}

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link to="/profile" className="bg-sage-600 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700">
            Xem lịch sử đơn hàng
          </Link>
          <Link to="/collection" className="border border-gray-300 px-8 py-4 text-[10px] font-bold uppercase tracking-[0.25em] text-brand-dark transition-colors hover:border-sage-500 hover:text-sage-700">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}

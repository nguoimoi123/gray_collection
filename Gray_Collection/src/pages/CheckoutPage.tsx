import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { createMomoPayment, createOrder, createVnpayPayment } from '../services/api';

const initialForm = {
  shipping_address: '',
  city: '',
  province: '',
  postal_code: '',
  phone: '',
  payment_method: 'cod' as 'cod' | 'momo' | 'vnpay',
};

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, cartTotal, clearCart } = useCart();
  const { customer, customerId, isAuthenticated, isLoading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!customer) return;
    setForm((prev) => ({
      ...prev,
      shipping_address: customer.address || '',
      city: customer.city || '',
      province: customer.province || '',
      postal_code: customer.postal_code || '',
      phone: customer.phone || '',
    }));
  }, [customer]);

  const selectedPaymentDescription = useMemo(() => {
    if (form.payment_method === 'cod') return 'Nhận hàng rồi thanh toán. Đơn sẽ ở trạng thái chờ xác nhận cho đến khi shop duyệt.';
    if (form.payment_method === 'momo') return 'Bạn sẽ được chuyển sang MoMo để hoàn tất thanh toán. Sau khi thanh toán xong, đơn vẫn cần shop xác nhận.';
    return 'Bạn sẽ được chuyển sang VNPay để xác nhận giao dịch. Sau khi thanh toán xong, đơn vẫn cần shop xác nhận.';
  }, [form.payment_method]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!customerId) return setError('Bạn cần đăng nhập trước khi đặt hàng.');
    if (!items.length) return setError('Giỏ hàng đang trống.');
    if (!form.phone.trim() || !form.shipping_address.trim() || !form.city.trim() || !form.province.trim()) {
      return setError('Vui lòng điền đầy đủ thông tin giao hàng.');
    }

    setIsSubmitting(true);
    try {
      const order = await createOrder({
        customer: customerId,
        items: items.map((item) => ({
          product_id: item.productId,
          quantity: item.quantity,
          variant_size_ml: item.variantSizeMl,
        })),
        shipping_address: form.shipping_address.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        postal_code: form.postal_code.trim(),
        phone: form.phone.trim(),
        payment_method: form.payment_method,
      });

      if (form.payment_method === 'cod') {
        clearCart();
        setSuccessMessage(`Đặt hàng thành công. Mã đơn của bạn là ${order.id}.`);
        setTimeout(() => navigate('/order-success', {
          state: {
            orderId: order.id,
            paymentMethod: form.payment_method,
            title: 'Đặt hàng thành công',
            message: 'Đơn COD đã được ghi nhận và đang chờ shop xác nhận.',
          },
        }), 800);
        return;
      }

      if (form.payment_method === 'momo') {
        const payment = await createMomoPayment(order.id);
        window.location.href = payment.payUrl;
        return;
      }

      const payment = await createVnpayPayment(order.id);
      window.location.href = payment.payUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100 px-6 py-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src="/image.png" alt="Gray Collection" className="h-8 object-contain" />
          </Link>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-600">Thanh toán an toàn</div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12 lg:flex-row">
        <div className="flex-1">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <section>
              <h2 className="mb-6 text-2xl font-serif">Thông tin liên hệ</h2>
              <input type="email" value={customer?.email || ''} disabled className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm opacity-70 focus:outline-none" />
            </section>

            <section>
              <h2 className="mb-6 text-2xl font-serif">Địa chỉ nhận hàng</h2>
              <div className="space-y-4">
                <input type="text" value={form.phone} onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))} placeholder="Số điện thoại" className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" />
                <input type="text" value={form.shipping_address} onChange={(event) => setForm((prev) => ({ ...prev, shipping_address: event.target.value }))} placeholder="Địa chỉ" className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <input type="text" value={form.city} onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))} placeholder="Thành phố" className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" />
                  <input type="text" value={form.province} onChange={(event) => setForm((prev) => ({ ...prev, province: event.target.value }))} placeholder="Tỉnh" className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" />
                  <input type="text" value={form.postal_code} onChange={(event) => setForm((prev) => ({ ...prev, postal_code: event.target.value }))} placeholder="Mã bưu chính" className="w-full border-none bg-sage-50/50 px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-sage-300" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-6 text-2xl font-serif">Phương thức thanh toán</h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {[
                  { value: 'cod' as const, label: 'COD' },
                  { value: 'momo' as const, label: 'MoMo' },
                  { value: 'vnpay' as const, label: 'VNPay' },
                ].map((item) => (
                  <button key={item.value} type="button" onClick={() => setForm((prev) => ({ ...prev, payment_method: item.value }))} className={`border px-4 py-4 text-left text-sm transition-colors ${form.payment_method === item.value ? 'border-sage-600 bg-sage-50 text-sage-800' : 'border-gray-200 hover:border-sage-400'}`}>
                    <span className="block font-medium">{item.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-brand-gray">{selectedPaymentDescription}</p>
            </section>

            {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
            {successMessage && <p className="rounded-2xl bg-green-50 px-4 py-3 text-sm text-green-700">{successMessage}</p>}

            <button type="submit" disabled={isSubmitting} className="w-full bg-sage-600 py-5 text-[10px] font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700 disabled:opacity-70">
              {isSubmitting ? 'Đang xử lý...' : `Hoàn tất đặt hàng - ${cartTotal.toLocaleString('vi-VN')}đ`}
            </button>
          </form>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="border border-sage-100 bg-sage-50/30 p-8">
            <h2 className="mb-8 text-xl font-serif italic">Đơn hàng của bạn</h2>
            <div className="mb-8 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="h-16 w-16 flex-shrink-0 border border-gray-100 bg-white">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover p-1" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-sm">{item.name}</h4>
                    <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.2em] text-brand-gray">{item.type} - SL {item.quantity}</p>
                    <p className="text-sm font-medium">{item.price.toLocaleString('vi-VN')}đ</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-8 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-gray">Tạm tính</span>
                <span className="font-medium">{cartTotal.toLocaleString('vi-VN')}đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-gray">Vận chuyển</span>
                <span className="italic text-brand-gray">Tính sau</span>
              </div>
            </div>

            <div className="flex items-end justify-between border-t border-gray-200 pt-6">
              <span className="font-sans font-medium">Tổng cộng</span>
              <span className="text-2xl font-serif">{cartTotal.toLocaleString('vi-VN')}đ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

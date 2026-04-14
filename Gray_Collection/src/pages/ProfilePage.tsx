import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { fetchOrdersByCustomer } from '../services/api';
import type { Order } from '../types/account';

function statusLabel(status: string) {
  switch (status) {
    case 'Cho Xac Nhan':
      return 'Chờ xác nhận';
    case 'Dang Xu Ly':
      return 'Đang xử lý';
    case 'Cho Thanh Toan':
      return 'Chờ thanh toán';
    case 'Dang Van Chuyen':
      return 'Đang vận chuyển';
    case 'Da Giao':
      return 'Đã giao';
    case 'Da Huy':
      return 'Đã hủy';
    default:
      return status;
  }
}

export function ProfilePage() {
  const navigate = useNavigate();
  const { customer, customerId, isAuthenticated, isLoading, logout, saveProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    postal_code: '',
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login');
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!customer) return;
    setProfileForm({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      province: customer.province || '',
      postal_code: customer.postal_code || '',
    });
  }, [customer]);

  useEffect(() => {
    if (!customerId) {
      setOrders([]);
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    fetchOrdersByCustomer(customerId)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [customerId]);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      await saveProfile(profileForm);
      setMessage('Đã cập nhật thông tin tài khoản.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (isLoading || !customer) {
    return (
      <div className="mx-auto min-h-screen max-w-5xl px-6 pb-24 pt-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 w-1/3 bg-sage-100" />
          <div className="h-40 w-full bg-sage-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-6 pb-24 pt-12">
      <header className="mb-12 flex flex-col gap-4 border-b border-gray-200 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-serif">Tài khoản của bạn</h1>
          <p className="text-brand-gray">Xin chào {customer.first_name || 'bạn'}, đây là nơi theo dõi đơn hàng và cập nhật thông tin nhận hàng.</p>
        </div>
        <button onClick={handleLogout} className="text-[10px] font-bold uppercase tracking-[0.25em] text-brand-gray hover:text-brand-dark">
          Đăng xuất
        </button>
      </header>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        <div className="space-y-12 md:col-span-2">
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-serif">Lịch sử đơn hàng</h2>
              <Link to="/collection" className="text-[10px] font-bold uppercase tracking-[0.25em] text-sage-700 hover:text-sage-900">
                Mua thêm
              </Link>
            </div>

            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="animate-pulse border border-gray-100 bg-white p-6">
                    <div className="mb-4 h-5 w-1/3 bg-sage-100" />
                    <div className="h-20 w-full bg-sage-100" />
                  </div>
                ))}
              </div>
            ) : !orders.length ? (
              <div className="border border-gray-100 bg-white p-12 text-center">
                <p className="mb-6 text-brand-gray">Bạn chưa có đơn hàng nào.</p>
                <Link to="/collection" className="inline-block border-b border-brand-dark pb-1 text-[10px] font-bold uppercase tracking-[0.25em] transition-colors hover:border-sage-600 hover:text-sage-600">
                  Xem bộ sưu tập
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 bg-white p-6">
                    <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="text-sm font-medium">Mã đơn: {order.id}</p>
                        <p className="text-sm text-brand-gray">{new Date(order.created_at).toLocaleString('vi-VN')}</p>
                      </div>
                      <div className="text-left md:text-right">
                        <p className="text-lg font-medium">{order.total_price.toLocaleString('vi-VN')}đ</p>
                        <p className="text-sm text-brand-gray">
                          {statusLabel(order.status)} - {order.payment_method.toUpperCase()} - {(order.payment_status || 'pending') === 'paid' ? 'đã thanh toán' : (order.payment_status || 'pending') === 'failed' ? 'thất bại' : 'chờ thanh toán'}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.product_id}-${item.variant_size_ml || 'default'}`} className="flex gap-4 rounded-2xl bg-sage-50/40 p-4">
                          {item.product_image ? (
                            <img src={item.product_image} alt={item.product_name || item.product_id} className="h-16 w-16 rounded-2xl object-cover" />
                          ) : (
                            <div className="h-16 w-16 rounded-2xl bg-sage-100" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-brand-dark">{item.product_name || item.product_id}</p>
                            <p className="text-sm text-brand-gray">
                              {item.variant_label || (item.variant_size_ml ? `${item.variant_size_ml}ml` : 'Size mặc định')} - Số lượng {item.quantity}
                            </p>
                            <p className="mt-1 text-sm text-brand-gray">Đơn giá: {item.price.toLocaleString('vi-VN')}đ</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div>
          <section className="border border-sage-100 bg-sage-50/50 p-8">
            <h2 className="mb-6 text-xl font-serif">Thông tin tài khoản</h2>
            {message && <p className="mb-4 text-sm text-green-600">{message}</p>}
            {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
            <form className="space-y-4 text-sm text-brand-gray" onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-3">
                <input type="text" value={profileForm.first_name} onChange={(event) => setProfileForm((prev) => ({ ...prev, first_name: event.target.value }))} className="w-full border border-sage-100 bg-white px-4 py-3" placeholder="Họ" />
                <input type="text" value={profileForm.last_name} onChange={(event) => setProfileForm((prev) => ({ ...prev, last_name: event.target.value }))} className="w-full border border-sage-100 bg-white px-4 py-3" placeholder="Tên" />
              </div>
              <input type="email" value={customer.email} disabled className="w-full border border-sage-100 bg-white px-4 py-3 opacity-70" />
              <input type="text" value={profileForm.phone} onChange={(event) => setProfileForm((prev) => ({ ...prev, phone: event.target.value }))} className="w-full border border-sage-100 bg-white px-4 py-3" placeholder="Số điện thoại" />
              <input type="text" value={profileForm.address} onChange={(event) => setProfileForm((prev) => ({ ...prev, address: event.target.value }))} className="w-full border border-sage-100 bg-white px-4 py-3" placeholder="Địa chỉ" />
              <input type="text" value={profileForm.city} onChange={(event) => setProfileForm((prev) => ({ ...prev, city: event.target.value }))} className="w-full border border-sage-100 bg-white px-4 py-3" placeholder="Thành phố" />
              <input type="text" value={profileForm.province} onChange={(event) => setProfileForm((prev) => ({ ...prev, province: event.target.value }))} className="w-full border border-sage-100 bg-white px-4 py-3" placeholder="Tỉnh" />
              <input type="text" value={profileForm.postal_code} onChange={(event) => setProfileForm((prev) => ({ ...prev, postal_code: event.target.value }))} className="w-full border border-sage-100 bg-white px-4 py-3" placeholder="Mã bưu chính" />
              <button type="submit" className="w-full bg-sage-600 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-white hover:bg-sage-700">
                Lưu thông tin
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, CreditCard, Loader, MapPin, User } from 'lucide-react';

interface ApiOrderItem {
  product_id?: string;
  product_name?: string;
  product_image?: string;
  quantity: number;
  price: number;
  variant_label?: string;
}

interface ApiCustomer {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

interface ApiOrder {
  id: string;
  customer: ApiCustomer | string;
  items: ApiOrderItem[];
  total_price: number;
  status: 'Cho Xac Nhan' | 'Dang Xu Ly' | 'Cho Thanh Toan' | 'Dang Van Chuyen' | 'Da Giao' | 'Da Huy';
  payment_status?: 'pending' | 'paid' | 'failed';
  payment_method?: 'cod' | 'momo' | 'vnpay';
  shipping_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

const statusLabel: Record<ApiOrder['status'], string> = {
  'Cho Xac Nhan': 'Cho xac nhan',
  'Dang Xu Ly': 'Dang xu ly',
  'Cho Thanh Toan': 'Cho thanh toan',
  'Dang Van Chuyen': 'Dang van chuyen',
  'Da Giao': 'Da giao',
  'Da Huy': 'Da huy',
};

function paymentStatusLabel(status?: ApiOrder['payment_status']) {
  if (status === 'paid') return 'Da thanh toan';
  if (status === 'failed') return 'That bai';
  return 'Cho thanh toan';
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ApiOrder['status']>('Cho Xac Nhan');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;
    axios
      .get<ApiOrder>(`${import.meta.env.VITE_API_URL}/order/${orderId}/`)
      .then((response) => {
        setOrder(response.data);
        setSelectedStatus(response.data.status);
      })
      .catch(() => setError('Khong the tai chi tiet don hang.'))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!orderId) return;

    try {
      setIsUpdatingStatus(true);
      setError(null);
      setSuccessMessage(null);

      const response = await axios.patch<ApiOrder>(
        `${import.meta.env.VITE_API_URL}/order/${orderId}/status/`,
        { status: selectedStatus }
      );

      setOrder(response.data);
      setSelectedStatus(response.data.status);
      setSuccessMessage('Da cap nhat trang thai don hang.');
    } catch (updateError) {
      setError('Khong the cap nhat trang thai don hang.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader className="mr-2 h-8 w-8 animate-spin text-blue-600" />Dang tai chi tiet don hang...</div>;
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-8">
        <button onClick={() => navigate('/orders')} className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> Quay lai danh sach don hang
        </button>
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <AlertCircle size={22} />
          <span>{error || 'Khong tim thay don hang.'}</span>
        </div>
      </div>
    );
  }

  const customer = typeof order.customer === 'string' ? null : order.customer;
  const customerName = customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email || customer.id : 'Khach le';

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <button onClick={() => navigate('/orders')} className="mb-4 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft size={18} /> Quay lai danh sach don hang
        </button>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="mb-2 text-3xl font-semibold text-gray-900">Chi tiet don hang</h1>
            <p className="text-gray-600">Ma don: <span className="font-medium text-gray-900">{order.id}</span></p>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">{statusLabel[order.status]}</span>
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
              {paymentStatusLabel(order.payment_status)}
            </span>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl border border-gray-200 bg-white xl:col-span-2">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">San pham trong don</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {order.items.map((item, index) => (
              <div key={`${item.product_id || item.product_name}-${index}`} className="flex gap-4 px-6 py-4">
                <img
                  src={item.product_image || 'https://placehold.co/96x96?text=Perfume'}
                  alt={item.product_name || item.product_id || 'San pham'}
                  className="h-20 w-20 rounded-xl border border-gray-200 bg-gray-50 object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.product_name || item.product_id || 'San pham'}</p>
                  <p className="mt-1 text-sm text-gray-500">ID: {item.product_id || 'N/A'}</p>
                  <p className="mt-1 text-sm text-gray-600">{item.variant_label || 'Size mac dinh'} • So luong {item.quantity}</p>
                  <p className="mt-2 text-sm font-medium text-gray-900">Don gia {Number(item.price).toLocaleString('vi-VN')}đ</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Thanh tien</p>
                  <p className="font-semibold text-gray-900">{(Number(item.price) * item.quantity).toLocaleString('vi-VN')}đ</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Tong thanh toan</p>
              <p className="text-2xl font-bold text-gray-900">{Number(order.total_price).toLocaleString('vi-VN')}đ</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 }} className="space-y-6">
          <InfoCard title="Khach hang" icon={<User size={18} />}>
            <p><span className="text-gray-500">Ho ten:</span> <span className="font-medium text-gray-900">{customerName}</span></p>
            <p><span className="text-gray-500">Email:</span> <span className="text-gray-900">{customer?.email || 'N/A'}</span></p>
            <p><span className="text-gray-500">Dien thoai:</span> <span className="text-gray-900">{customer?.phone || order.phone || 'N/A'}</span></p>
          </InfoCard>

          <InfoCard title="Giao hang" icon={<MapPin size={18} />}>
            <p className="text-gray-900">{order.shipping_address || 'N/A'}</p>
            <p className="text-gray-900">{[order.city, order.province].filter(Boolean).join(', ') || 'N/A'}</p>
            <p className="text-gray-900">Ma buu chinh: {order.postal_code || 'N/A'}</p>
          </InfoCard>

          <InfoCard title="Thanh toan" icon={<CreditCard size={18} />}>
            <p><span className="text-gray-500">Phuong thuc:</span> <span className="font-medium text-gray-900 uppercase">{order.payment_method || 'cod'}</span></p>
            <p><span className="text-gray-500">Trang thai payment:</span> <span className="text-gray-900">{paymentStatusLabel(order.payment_status)}</span></p>
            <p><span className="text-gray-500">Ngay tao:</span> <span className="text-gray-900">{new Date(order.created_at).toLocaleString('vi-VN')}</span></p>
            <p><span className="text-gray-500">Cap nhat:</span> <span className="text-gray-900">{new Date(order.updated_at).toLocaleString('vi-VN')}</span></p>
          </InfoCard>

          <InfoCard title="Cap nhat trang thai" icon={<AlertCircle size={18} />}>
            <div className="space-y-4">
              <select
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value as ApiOrder['status'])}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500"
              >
                {Object.entries(statusLabel).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || selectedStatus === order.status}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdatingStatus ? 'Dang cap nhat...' : 'Cap nhat trang thai'}
              </button>

              {successMessage && (
                <p className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</p>
              )}

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                <p>COD: khi chuyen sang <span className="font-medium">Da Giao</span>, he thong tu dong danh dau <span className="font-medium">Da thanh toan</span>.</p>
                <p>MoMo/VNPay: sau khi thanh toan thanh cong, payment se tu o trang thai <span className="font-medium">Da thanh toan</span>.</p>
              </div>
            </div>
          </InfoCard>
        </motion.div>
      </div>
    </div>
  );
}

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900">
        {icon}
        {title}
      </h3>
      <div className="space-y-2 text-sm">{children}</div>
    </div>
  );
}

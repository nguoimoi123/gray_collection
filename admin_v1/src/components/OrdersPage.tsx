import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Eye, Loader, Search } from 'lucide-react';

interface ApiOrderItem {
  product_id?: string;
  product_name?: string;
  quantity: number;
  price: number;
  variant_label?: string;
}

interface ApiCustomer {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface ApiOrder {
  id: string;
  customer: ApiCustomer;
  items: ApiOrderItem[];
  total_price: number;
  status: 'Cho Xac Nhan' | 'Dang Xu Ly' | 'Cho Thanh Toan' | 'Dang Van Chuyen' | 'Da Giao' | 'Da Huy';
  payment_status?: 'pending' | 'paid' | 'failed';
  payment_method?: 'cod' | 'momo' | 'vnpay';
  created_at: string;
}

const ORDERS_PER_PAGE = 10;

const statusLabel: Record<ApiOrder['status'], string> = {
  'Cho Xac Nhan': 'Cho xac nhan',
  'Dang Xu Ly': 'Dang xu ly',
  'Cho Thanh Toan': 'Cho thanh toan',
  'Dang Van Chuyen': 'Dang van chuyen',
  'Da Giao': 'Da giao',
  'Da Huy': 'Da huy',
};

export function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios
      .get<ApiOrder[]>(`${import.meta.env.VITE_API_URL}/order/`)
      .then((response) => setOrders(response.data))
      .catch(() => setError('Khong the tai du lieu don hang. Vui long thu lai sau.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const customerName = `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim();
      const firstItem = order.items[0];
      const productLabel = firstItem?.product_name || firstItem?.product_id || '';
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchPayment = paymentFilter === 'all' || order.payment_status === paymentFilter;
      const matchSearch = [order.id, customerName, productLabel].join(' ').toLowerCase().includes(query);
      return matchStatus && matchPayment && matchSearch;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, paymentFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ORDERS_PER_PAGE));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader className="mr-2 h-8 w-8 animate-spin text-blue-600" />Dang tai don hang...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center py-12 text-red-500"><AlertCircle className="mr-2 h-8 w-8" />{error}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold text-gray-900">Don hang</h1>
        <p className="mb-6 text-gray-600">Theo doi xu ly don, payment status va phuong thuc thanh toan.</p>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tim theo ma don, ten khach, san pham..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          {['all', 'Cho Xac Nhan', 'Dang Xu Ly', 'Cho Thanh Toan', 'Dang Van Chuyen', 'Da Giao', 'Da Huy'].map((item) => (
            <button
              key={item}
              onClick={() => setStatusFilter(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${statusFilter === item ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {item === 'all' ? 'Tat ca trang thai' : statusLabel[item as ApiOrder['status']]}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-3">
          {[
            { key: 'all', label: 'Tat ca thanh toan' },
            { key: 'paid', label: 'Da thanh toan' },
            { key: 'pending', label: 'Cho thanh toan' },
            { key: 'failed', label: 'That bai' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setPaymentFilter(item.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${paymentFilter === item.key ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ma don</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Khach hang</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">San pham</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tong tien</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Trang thai</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Thanh toan</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phuong thuc</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ngay tao</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Chi tiet</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length ? (
                paginatedOrders.map((order, index) => {
                  const customerName = `${order.customer.first_name || ''} ${order.customer.last_name || ''}`.trim() || order.customer.email || 'Khach le';
                  const firstItem = order.items[0];
                  const productLabel = firstItem?.product_name || firstItem?.product_id || 'Nhieu san pham';
                  return (
                    <motion.tr key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 text-gray-700">{customerName}</td>
                      <td className="px-6 py-4 text-gray-700">{productLabel}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{Number(order.total_price).toLocaleString('vi-VN')}đ</td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">{statusLabel[order.status]}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' : order.payment_status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {order.payment_status === 'paid' ? 'Da thanh toan' : order.payment_status === 'failed' ? 'That bai' : 'Cho thanh toan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 uppercase text-gray-700">{order.payment_method || 'cod'}</td>
                      <td className="px-6 py-4 text-gray-600">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">
                        <Link to={`/orders/${order.id}`} className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100" title="Xem chi tiet">
                          <Eye size={18} />
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">Khong co don hang nao phu hop bo loc hien tai.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button type="button" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={currentPage === 1} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
            <ChevronLeft size={16} /> Truoc
          </button>
          <span className="px-2 text-sm text-gray-600">Trang {currentPage}/{totalPages}</span>
          <button type="button" onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50">
            Sau <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

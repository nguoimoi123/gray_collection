import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useCart } from '../context/CartContext';
import { confirmVnpayPayment } from '../services/api';

export function VnpayReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [message, setMessage] = useState('Đang xác nhận thanh toán VNPay...');
  const [error, setError] = useState('');

  useEffect(() => {
    const payload = Object.fromEntries(searchParams.entries());

    confirmVnpayPayment(payload)
      .then((data) => {
        if (data.payment_status === 'paid') {
          clearCart();
          setMessage('Thanh toán VNPay thành công. Đang chuyển đến trang xác nhận đơn hàng...');
          setTimeout(() => navigate('/order-success', {
            state: {
              paymentMethod: 'vnpay',
              title: 'Thanh toán thành công',
              message: 'Giao dịch VNPay đã được xác nhận. Đơn hàng của bạn đã sẵn sàng để xử lý.',
            },
          }), 1000);
          return;
        }
        setError('Thanh toán VNPay chưa thành công hoặc đã bị hủy.');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán VNPay.');
      });
  }, [clearCart, navigate, searchParams]);

  return <div className="min-h-screen px-6 pt-20">{error ? <p className="text-red-500">{error}</p> : <p>{message}</p>}</div>;
}

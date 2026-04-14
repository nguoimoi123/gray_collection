import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useCart } from '../context/CartContext';
import { confirmMomoPayment } from '../services/api';

export function MomoReturnPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const [message, setMessage] = useState('Đang xác nhận thanh toán MoMo...');
  const [error, setError] = useState('');

  useEffect(() => {
    const payload = Object.fromEntries(searchParams.entries());

    confirmMomoPayment(payload)
      .then((data) => {
        if (data.payment_status === 'paid') {
          clearCart();
          setMessage('Thanh toán MoMo thành công. Đang chuyển đến trang xác nhận đơn hàng...');
          setTimeout(() => navigate('/order-success', {
            state: {
              paymentMethod: 'momo',
              title: 'Thanh toán thành công',
              message: 'Giao dịch MoMo đã được xác nhận. Đơn hàng của bạn đã xuất hiện trong lịch sử mua sắm.',
            },
          }), 1000);
          return;
        }
        setError('Thanh toán chưa thành công hoặc đã bị hủy.');
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Không thể xác nhận thanh toán MoMo.');
      });
  }, [clearCart, navigate, searchParams]);

  return <div className="min-h-screen px-6 pt-20">{error ? <p className="text-red-500">{error}</p> : <p>{message}</p>}</div>;
}

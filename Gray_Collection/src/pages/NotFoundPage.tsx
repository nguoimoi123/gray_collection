import React from 'react';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-24 text-center">
      <div className="mb-8">
        <span className="text-[8rem] font-serif leading-none text-sage-200">404</span>
      </div>
      <h1 className="mb-4 text-3xl font-serif text-brand-dark md:text-4xl">
        Trang không tồn tại
      </h1>
      <p className="mb-10 max-w-md text-brand-gray leading-relaxed">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        Hãy quay lại trang chủ hoặc khám phá bộ sưu tập mùi hương của chúng tôi.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link
          to="/"
          className="bg-sage-600 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-white transition-colors hover:bg-sage-700"
        >
          Về trang chủ
        </Link>
        <Link
          to="/collection"
          className="border border-sage-300 px-8 py-4 text-xs font-bold uppercase tracking-[0.25em] text-brand-dark transition-colors hover:border-sage-600 hover:bg-sage-50"
        >
          Xem bộ sưu tập
        </Link>
      </div>
    </div>
  );
}

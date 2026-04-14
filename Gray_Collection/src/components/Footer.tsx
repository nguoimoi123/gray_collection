import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-sage-50 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1">
          <Link to="/" className="flex items-center mb-6">
            <img src="/image.png" alt="Gray Collection" className="h-8 object-contain" />
          </Link>
          <p className="text-brand-gray text-sm leading-relaxed pr-8">
            Gray Collection chuyên nước hoa chiết với nhiều lựa chọn nữ, nam và unisex, giúp bạn test mùi dễ hơn và chọn đúng gu hơn.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase mb-6">Khám Phá</h4>
          <ul className="space-y-4">
            <li><Link to="/collection" className="text-brand-gray hover:text-brand-dark text-sm transition-colors">Bộ sưu tập</Link></li>
            <li><Link to="/archive" className="text-brand-gray hover:text-brand-dark text-sm transition-colors">Lưu trữ</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase mb-6">Hỗ Trợ</h4>
          <ul className="space-y-4">
            <li><Link to="/checkout" className="text-brand-gray hover:text-brand-dark text-sm transition-colors">Thanh toán</Link></li>
            <li><Link to="/profile" className="text-brand-gray hover:text-brand-dark text-sm transition-colors">Tài khoản</Link></li>
            <li><Link to="/about" className="text-brand-gray hover:text-brand-dark text-sm transition-colors">Giới thiệu</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold tracking-widest uppercase mb-6">Nhận Tin Mới</h4>
          <form className="flex border-b border-brand-gray pb-2">
            <input type="email" placeholder="Email của bạn" className="bg-transparent border-none outline-none flex-1 text-sm italic placeholder:text-brand-gray" />
            <button type="submit" className="text-xs font-semibold tracking-widest uppercase hover:text-sage-600 transition-colors">Đăng Ký</button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center pt-8 border-t border-sage-200">
        <p className="text-xs text-brand-gray uppercase tracking-widest mb-4 md:mb-0">© 2026 Gray Collection. All rights reserved.</p>
        <div className="flex gap-4">
          <div className="w-2 h-2 rounded-full bg-sage-300" />
          <div className="w-2 h-2 rounded-full bg-sage-300" />
        </div>
      </div>
    </footer>
  );
}

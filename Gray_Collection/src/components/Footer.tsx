import React from 'react';
import { Link } from 'react-router-dom';

const facebookUrl = import.meta.env.VITE_FACEBOOK_URL || 'https://facebook.com/';
const tiktokUrl = import.meta.env.VITE_TIKTOK_URL || 'https://tiktok.com/';
const instagramUrl = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/';
const shopeeUrl = import.meta.env.VITE_SHOPEE_URL || 'https://shopee.vn/';

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className="flex h-11 w-11 items-center justify-center rounded-full text-black transition-transform duration-200 hover:-translate-y-0.5 hover:text-stone-700"
    >
      {children}
    </a>
  );
}

function FooterTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[2rem] font-semibold leading-tight text-black">{children}</h3>;
}

function FooterLink({
  to,
  children,
}: {
  to: string;
  children: React.ReactNode;
}) {
  return (
    <Link to={to} className="text-[1.05rem] leading-8 text-black transition-colors hover:text-stone-600">
      {children}
    </Link>
  );
}

function ContactRow({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className="flex items-center gap-3 text-[1.05rem] leading-8 text-black transition-colors hover:text-stone-600">
      <span className="flex h-7 w-7 items-center justify-center">
        {href.startsWith('mailto:') ? (
          <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
            <path d="M4 7.5h16v9H4z" />
            <path d="m5 8 7 5 7-5" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-current" fill="none" strokeWidth="1.8" aria-hidden="true">
            <path d="M21 16.9v2a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 1 3.1 2 2 0 0 1 3 1h2a2 2 0 0 1 2 1.7c.1.9.4 1.8.8 2.6a2 2 0 0 1-.5 2.1L6.1 8.6a16 16 0 0 0 9.3 9.3l1.2-1.2a2 2 0 0 1 2.1-.5c.8.4 1.7.7 2.6.8A2 2 0 0 1 21 16.9Z" />
          </svg>
        )}
      </span>
      <span>{children}</span>
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#f5f3ef] px-6 pb-10 pt-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.7fr_0.8fr_0.8fr_1.3fr]">
          <div>
            <FooterTitle>Về GRAY COLLECTION</FooterTitle>
            <p className="mt-8 max-w-[35rem] text-[1.1rem] leading-[1.8] text-black">
              &quot;Luxe - Art - Nostalgia&quot; Sang trọng là bản chất. Nghệ thuật là hình thái.
              Hoài niệm là dấu vết. Mỗi mùi hương là một tuyên ngôn thầm lặng dành cho người có gu sống riêng biệt.
            </p>

            <div className="mt-8 space-y-3">
              <ContactRow href="tel:0589506666">Khương Đình - Hà Nội: 058 950 6666</ContactRow>
              <ContactRow href="tel:0911165686">Hoà Mã - Hà Nội: 091116 5686</ContactRow>
              <ContactRow href="tel:0855528668">Trần Quang Khải - HCM: 085 552 8668</ContactRow>
              <ContactRow href="mailto:lanperfumestore@gmail.com">lanperfumestore@gmail.com</ContactRow>
            </div>

            <div className="mt-6 inline-flex items-center gap-3 rounded-xl bg-[#1897e6] px-3 py-2 text-white shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#1897e6]">
                <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current" aria-hidden="true">
                  <path d="m10 16.2-3.5-3.5-1.4 1.4 4.9 4.9L19 10l-1.4-1.4z" />
                </svg>
              </div>
              <div className="text-left">
                <div className="text-[0.72rem] font-semibold uppercase tracking-[0.18em]">Đã thông báo</div>
                <div className="text-[1rem] font-bold leading-none">Bộ Công Thương</div>
              </div>
            </div>
          </div>

          <div>
            <FooterTitle>Liên kết nhanh</FooterTitle>
            <div className="mt-8 flex flex-col items-start">
              <FooterLink to="/about">Giới thiệu</FooterLink>
              <FooterLink to="/collection">Bộ sưu tập nước hoa</FooterLink>
              <FooterLink to="/archive">Thương hiệu</FooterLink>
              <FooterLink to="/archive">Tin tức</FooterLink>
              <FooterLink to="/about">Liên hệ</FooterLink>
            </div>
          </div>

          <div>
            <FooterTitle>Sản phẩm</FooterTitle>
            <div className="mt-8 flex flex-col items-start">
              <FooterLink to="/collection">Nước hoa nam</FooterLink>
              <FooterLink to="/collection">Nước hoa nữ</FooterLink>
              <FooterLink to="/collection">Nước hoa unisex</FooterLink>
              <FooterLink to="/collection">Body spray</FooterLink>
            </div>
          </div>

          <div>
            <FooterTitle>Cửa hàng</FooterTitle>
            <div className="mt-8 space-y-4">
              <div>
                <p className="text-[1.1rem] font-semibold text-black">Hà Nội</p>
                <p className="mt-1 text-[1.05rem] leading-8 text-black">17 Ngõ 236 Khương Đình, Thanh Xuân, Hà Nội</p>
              </div>
              <div>
                <p className="text-[1.1rem] font-semibold text-black">Hà Nội</p>
                <p className="mt-1 text-[1.05rem] leading-8 text-black">108 Hoà Mã, Hai Bà Trưng, Hà Nội</p>
              </div>
              <div>
                <p className="text-[1.1rem] font-semibold text-black">TP. Hồ Chí Minh</p>
                <p className="mt-1 text-[1.05rem] leading-8 text-black">225F Trần Quang Khải, Tân Định, Quận 1, TP.HCM</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-black/20 pt-10">
          <div className="flex flex-col items-center text-center">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <SocialLink href={facebookUrl} label="Facebook">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                  <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.5c0-.8.2-1.4 1.4-1.4H16V5.6c-.2 0-.9-.1-1.8-.1-1.8 0-3 1.1-3 3.2v2.5H9v2.8h2.4v7h2.1Z" />
                </svg>
              </SocialLink>
              <SocialLink href={tiktokUrl} label="TikTok">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                  <path d="M14.8 3c.2 1.7 1.2 3.2 2.8 4 .9.5 1.8.7 2.7.8v2.9c-1-.1-2-.3-2.9-.7-.7-.3-1.3-.7-1.8-1.2v6.5c0 3-2.4 5.4-5.4 5.4S4.8 18.3 4.8 15.3s2.4-5.4 5.4-5.4c.3 0 .6 0 .9.1v3c-.3-.1-.6-.2-.9-.2-1.3 0-2.4 1.1-2.4 2.5s1.1 2.4 2.4 2.4 2.5-1.1 2.5-2.4V3h2.1Z" />
                </svg>
              </SocialLink>
              <SocialLink href={instagramUrl} label="Instagram">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                  <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm9.6 1.3a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8A3.2 3.2 0 1 0 12 15.2 3.2 3.2 0 0 0 12 8.8Z" />
                </svg>
              </SocialLink>
              <SocialLink href={shopeeUrl} label="Shopee">
                <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
                  <path d="M8.2 6.5A3.8 3.8 0 0 1 12 2.8a3.8 3.8 0 0 1 3.8 3.7h2.6v13.7H5.6V6.5h2.6Zm1.8 0H14A2 2 0 0 0 12 4.6a2 2 0 0 0-2 1.9Zm6.6 2H7.4v9.9h9.2V8.5Zm-2 2.3v1.8a4.6 4.6 0 0 0-1.9-.4c-1.2 0-1.8.4-1.8 1 0 .5.4.8 1.7 1.1 1.8.4 2.7 1 2.7 2.4 0 1.8-1.5 2.8-3.6 2.8-1.2 0-2.3-.2-3.1-.7v-1.9c.8.5 1.9.8 3 .8 1 0 1.7-.3 1.7-.9 0-.5-.4-.8-1.7-1.1-1.9-.4-2.7-1.1-2.7-2.5 0-1.6 1.4-2.8 3.6-2.8 1.1 0 1.9.1 2.7.4Z" />
                </svg>
              </SocialLink>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[1.02rem] text-black">
              <Link to="/chinh-sach-bao-mat" className="transition-colors hover:text-stone-600">
                Chính sách bảo mật
              </Link>
              <Link to="/chinh-sach-thanh-toan" className="transition-colors hover:text-stone-600">
                Chính sách thanh toán
              </Link>
              <Link to="/chinh-sach-bao-hanh-doi-tra" className="transition-colors hover:text-stone-600">
                Chính sách bảo hành
              </Link>
            </div>

            <p className="mt-6 text-[1.1rem] font-semibold text-black">
              Thiết kế bởi MINHQUAN.ENTERTAINMENT / Website
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

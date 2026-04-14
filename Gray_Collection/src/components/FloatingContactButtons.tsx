import React from 'react';

const messengerUrl = import.meta.env.VITE_MESSENGER_URL || 'https://m.me/';
const zaloUrl = import.meta.env.VITE_ZALO_URL || 'https://zalo.me/';

function ContactBubble({
  href,
  label,
  className,
  children,
}: {
  href: string;
  label: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={`group flex h-16 w-16 items-center justify-center rounded-full shadow-[0_18px_38px_rgba(34,34,34,0.18)] transition duration-300 hover:-translate-y-1 hover:scale-[1.03] ${className}`}
    >
      {children}
    </a>
  );
}

export function FloatingContactButtons() {
  return (
    <div className="fixed bottom-6 right-5 z-[70] flex flex-col gap-3 md:bottom-8 md:right-8">
      <ContactBubble
        href={messengerUrl}
        label="Liên hệ qua Messenger"
        className="bg-[linear-gradient(135deg,#00b2ff_0%,#7a38ff_52%,#ff6b7a_100%)] text-white"
      >
        <span className="text-[2rem] font-black leading-none tracking-[-0.08em]">⌁</span>
      </ContactBubble>

      <ContactBubble href={zaloUrl} label="Liên hệ qua Zalo" className="bg-[#0b86ea] text-white">
        <span className="text-[1.05rem] font-black tracking-[-0.04em]">Zalo</span>
      </ContactBubble>
    </div>
  );
}

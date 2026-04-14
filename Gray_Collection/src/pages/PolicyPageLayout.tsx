import React from 'react';

type PolicySection = {
  id: string;
  title: string;
  content?: string[];
  items?: string[];
};

export function PolicyPageLayout({
  title,
  sections,
}: {
  title: string;
  sections: PolicySection[];
}) {
  return (
    <div className="bg-[#f7f4ef] px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-black/5 bg-white px-6 py-10 shadow-[0_24px_70px_rgba(24,24,24,0.08)] md:px-12 md:py-14">
        <div className="border-b border-stone-200 pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Chính sách</p>
          <h1 className="mt-4 text-4xl text-stone-900 md:text-5xl">{title}</h1>
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-stone-50 px-5 py-6 md:px-7">
          <h2 className="text-lg font-semibold text-stone-900">Mục lục</h2>
          <ul className="mt-4 space-y-3 text-sm text-stone-700 md:text-base">
            {sections.map((section) => (
              <li key={section.id}>
                <a className="transition-colors hover:text-stone-950" href={`#${section.id}`}>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28">
              <h2 className="text-2xl text-stone-900">{section.title}</h2>
              {section.content?.map((paragraph, index) => (
                <p key={`${section.id}-p-${index}`} className="mt-4 text-base leading-8 text-stone-700">
                  {paragraph}
                </p>
              ))}
              {section.items && (
                <ul className="mt-4 space-y-3 text-base leading-8 text-stone-700">
                  {section.items.map((item, index) => (
                    <li key={`${section.id}-i-${index}`}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

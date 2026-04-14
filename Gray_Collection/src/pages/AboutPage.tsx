import React from 'react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-100">
      <section className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-[2.5rem] border border-stone-200 bg-white/90 shadow-[0_20px_80px_rgba(0,0,0,0.08)] backdrop-blur">
          <div className="bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(244,244,243,0.92)_45%,_rgba(233,232,229,0.9))] px-6 py-14 text-center sm:px-10 sm:py-20">
            <p className="mb-4 text-[14px] font-semibold uppercase tracking-[0.25em] text-sage-500">GRAY PERFUME</p>
            <h1 className="mb-8 text-2xl font-serif italic leading-tight text-brand-dark sm:text-5xl md:text-4xl">
              Về Gray Collection
            </h1>
            <div className="mx-auto max-w-3xl space-y-6 text-base leading-8 text-brand-gray sm:text-lg sm:leading-9">
              <p>
                Cảm ơn bạn đã dừng lại tại Gray Collection, nơi mỗi tầng hương không chỉ là một mùi thơm, mà là một lát cắt cảm xúc rất riêng. Chúng tôi tin rằng “xám” không phải là sự mờ nhạt, mà là vùng giao thoa tinh tế giữa những đối lập: nhẹ nhàng nhưng sâu sắc, tối giản nhưng đầy chiều sâu.
              </p>
              <p>
                Mỗi chai nước hoa tại Gray Collection được lựa chọn và hoàn thiện như một “bản sắc xám” khó đoán, khó quên và chỉ thực sự phù hợp với những ai hiểu chính mình.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-[2rem] border border-stone-200 bg-white px-6 py-8 shadow-sm sm:px-8 sm:py-10">
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-gray">Câu chuyện thương hiệu</p>
            <div className="space-y-6 text-base leading-8 text-brand-gray sm:text-lg sm:leading-9">
              <p>
                Trong những dịp cao điểm, đặc biệt gần lễ, số lượng đơn hàng tăng nhanh có thể khiến quá trình xử lý đôi lúc chưa trọn vẹn như mong muốn. Gray Collection luôn nỗ lực từng ngày để mang đến trải nghiệm tốt nhất, nên nếu có bất kỳ thiếu sót nào, rất mong nhận được sự cảm thông và đồng hành từ bạn.
              </p>
              <p>
                Gray Collection được hình thành từ một hành trình rất thật, hành trình đi tìm sự khác biệt trong thế giới đầy những lựa chọn giống nhau. Không bắt đầu từ những điều lớn lao, mà từ niềm yêu thích mùi hương, từ những lần thử, sai rồi lại thử, đội ngũ Gray dần nhận ra rằng nước hoa không chỉ để “thơm”, mà là cách mỗi người kể câu chuyện của riêng mình mà không cần lời nói.
              </p>
              <p>
                Có những giai đoạn, mọi thứ gần như bắt đầu từ con số 0: không nền tảng, không định hướng rõ ràng, chỉ có một niềm tin duy nhất rằng nếu đủ chân thành với sản phẩm và khách hàng, sẽ có người cảm nhận được. Và chính những khách hàng đầu tiên, những người chọn tin, đã trở thành nền móng để Gray Collection từng bước định hình bản sắc của mình.
              </p>
              <p>
                Hôm nay, Gray Collection không chỉ đơn thuần là một cửa hàng nước hoa, mà là nơi bạn có thể chậm lại một chút, lắng nghe bản thân và tìm ra mùi hương phản chiếu đúng con người mình. Chúng tôi không cố gắng bán cho bạn một mùi hương phổ biến, mà mong muốn cùng bạn khám phá một dấu ấn độc bản, thứ sẽ ở lại rất lâu ngay cả khi bạn đã rời đi.
              </p>
            </div>
          </article>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-stone-200 bg-stone-900 px-6 py-8 text-stone-100 shadow-sm sm:px-8">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-stone-400">Tinh thần Gray</p>
              <h2 className="mb-5 text-3xl font-serif italic leading-tight sm:text-4xl">
                Mùi hương là chữ ký vô hình của mỗi người
              </h2>
              <p className="text-sm leading-7 text-stone-300 sm:text-base sm:leading-8">
                Gray theo đuổi những mùi hương có chiều sâu, có khoảng lặng và có cá tính riêng, để mỗi lựa chọn không chỉ hợp gu mà còn thật sự chạm đúng cảm xúc.
              </p>
            </div>

            <div className="rounded-[2rem] border border-stone-200 bg-stone-100 px-6 py-8 shadow-sm sm:px-8">
              <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.3em] text-brand-gray">Ba nét nhận diện</p>
              <div className="space-y-5 text-brand-gray">
                <div>
                  <h3 className="mb-2 text-xl font-serif text-brand-dark">Tinh tế trong đối lập</h3>
                  <p className="text-sm leading-7 sm:text-base sm:leading-8">
                    Nhẹ nhàng nhưng không nhạt, tối giản nhưng không đơn điệu.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-serif text-brand-dark">Chọn mùi theo bản thân</h3>
                  <p className="text-sm leading-7 sm:text-base sm:leading-8">
                    Mỗi gợi ý đều hướng tới cảm xúc, nhịp sống và dấu ấn cá nhân thay vì chạy theo số đông.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-serif text-brand-dark">Đồng hành thật lòng</h3>
                  <p className="text-sm leading-7 sm:text-base sm:leading-8">
                    Từ cách chọn sản phẩm đến cách phục vụ, Gray luôn muốn mang lại một trải nghiệm chân thành và chỉn chu hơn mỗi ngày.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

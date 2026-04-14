import React from 'react';
import { PolicyPageLayout } from './PolicyPageLayout';

const sections = [
  {
    id: 'chinh-sach-bao-hanh',
    title: 'Chính sách bảo hành',
    content: ['LAN Perfume sẽ hỗ trợ khách hàng đổi sản phẩm trong vòng 03 ngày kể từ ngày mua tại cửa hàng hoặc 03 ngày kể từ ngày nhận hàng online. Quý khách vui lòng quay lại video khi nhận hàng.'],
  },
  {
    id: 'dieu-kien-doi-hang',
    title: '1. ĐIỀU KIỆN ĐỔI HÀNG',
    items: [
      'Sản phẩm khách hàng chưa sử dụng, còn nguyên seal, tem niêm phong của LAN Perfume hoặc hóa đơn mua hàng.',
      'Sản phẩm bị hư hỏng do lỗi của nhà sản xuất.',
      'Hư hỏng phần vòi xịt, thân chai nứt, bể trong quá trình vận chuyển.',
      'Nước hoa bị rò rỉ, giảm dung tích so với thực tế khi vừa nhận hàng.',
      'Nước hoa bị biến đổi màu hoặc mùi hương khi nhận hàng.',
      'Giao sai hoặc nhầm lẫn với mùi hương khác so với đơn đặt hàng.',
      'LƯU Ý: Chỉ nhận đổi hàng khi có video nhận hàng.',
    ],
  },
  {
    id: 'quy-trinh-doi-hang',
    title: '2. QUY TRÌNH ĐỔI HÀNG',
    items: [
      'Đổi với sản phẩm khách hàng chưa sử dụng: giá trị sản phẩm mới phải tương đương hoặc cao hơn giá trị đổi của sản phẩm cũ. Nếu giá cao hơn, khách hàng vui lòng thanh toán thêm phần chênh lệch.',
      'Đổi với các sản phẩm bị hư hỏng do lỗi của nhà sản xuất: LAN Perfume sẽ hỗ trợ khách đổi sản phẩm, hỗ trợ 100% chi phí phát sinh.',
    ],
  },
  {
    id: 'cac-truong-hop-khong-ho-tro-doi',
    title: '3. CÁC TRƯỜNG HỢP KHÔNG HỖ TRỢ ĐỔI',
    items: [
      'Không áp dụng đổi hàng cho các sản phẩm chiết, gốc chiết.',
      'Các sản phẩm không còn nguyên seal, seal có dấu hiệu bị rách, bẩn.',
      'Các sản phẩm không có tem niêm phong của LAN Perfume hoặc tem có dấu hiệu bị cạy, rách.',
      'Các sản phẩm được LAN Perfume tặng kèm khi mua hàng tại cửa hàng hoặc qua hình thức online.',
      'Các sản phẩm đã quá hạn đổi trả.',
    ],
  },
  {
    id: 'cac-luu-y-dac-biet',
    title: '4. CÁC LƯU Ý ĐẶC BIỆT',
    items: [
      'Khách hàng vui lòng trả phí vận chuyển, phí phát sinh trong trường hợp muốn đổi sản phẩm qua hình thức Online.',
      'Khách hàng mua Online vui lòng quay lại video khi nhận hàng.',
      'Trước khi đổi hàng qua hình thức Online, quý khách vui lòng quay chụp lại 6 mặt của sản phẩm gửi qua Fanpage @Lanperfumeauth (LAN Perfume) hoặc Instagram lanperfume.official.',
    ],
  },
];

export function WarrantyPolicyPage() {
  return <PolicyPageLayout title="Chính sách bảo hành và đổi trả" sections={sections} />;
}

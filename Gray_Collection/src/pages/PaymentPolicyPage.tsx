import React from 'react';
import { PolicyPageLayout } from './PolicyPageLayout';

const sections = [
  {
    id: 'thanh-toan',
    title: '1. THANH TOÁN',
    content: [
      'Khi quý khách mua hàng tại LAN Perfume có thể lựa chọn 1 trong 2 hình thức thanh toán: COD (Cash on Delivery - Thanh toán khi nhận hàng) hoặc chuyển khoản trước.',
    ],
    items: ['CHỦ TÀI KHOẢN: NGUYỄN NGỌC LÂN.', 'Ngân hàng Techcombank.', 'STK: 5686999669.'],
  },
  {
    id: 'hinh-thuc-van-chuyen-giao-nhan',
    title: '2. HÌNH THỨC VẬN CHUYỂN & GIAO NHẬN',
    content: ['Khi mua hàng tại LAN Perfume, quý khách có thể lựa chọn một trong các hình thức vận chuyển, giao nhận sau:'],
    items: [
      'Giao hàng trực tiếp: LAN Perfume trực tiếp vận chuyển và giao hàng tận tay khách hàng đối với những đơn hàng nội thành.',
      'Giao hàng online: LAN Perfume giao hàng cho khách hàng thông qua các nhà cung cấp dịch vụ chuyển phát.',
      'Nhân viên sẽ liên lạc trước với những khách hàng không có yêu cầu về thời gian để sắp xếp thời gian hợp lý với khách hàng.',
      'Với những khách hàng có yêu cầu về thời gian, nhân viên sẽ liên lạc và sắp xếp giao đúng giờ khách hàng yêu cầu.',
      'Trừ những trường hợp thời gian quá cấp bách hoặc ngoài thời gian làm việc của cửa hàng, nhân viên sẽ liên lạc và thỏa thuận lại với thời gian của khách hàng cho hợp lý.',
      'Quý khách vui lòng trực tiếp kiểm tra kỹ sản phẩm ngay khi nhận được hàng từ nhân viên giao hàng. Nếu có vấn đề liên quan tới chủng loại, mẫu mã, chất lượng, số lượng hàng hóa không đúng như trong đơn đặt hàng, quý khách vui lòng báo ngay cho chúng tôi để phối hợp xử lý.',
      'Trường hợp vì một lý do nào đó nhân viên giao hàng không thể giao hàng kịp thời, quý khách vui lòng liên hệ lại và thông báo cho cửa hàng để chúng tôi có thể hỗ trợ quý khách trong thời gian sớm nhất.',
      'Freeship đối với những đơn hàng Fullbox.',
      'Hỗ trợ 100% phí ship trong trường hợp giao sai hàng đối với đơn hàng khách đã đặt.',
      'Quý khách vui lòng chuyển khoản trước tiền cọc hoặc 100% giá trị sản phẩm với đơn online.',
      'Khi đặt hàng, quý khách vui lòng điền đầy đủ và chính xác các thông tin cần thiết theo yêu cầu để tạo điều kiện thuận lợi cho chúng tôi trong việc cung cấp hàng hóa và nhận thanh toán nhanh chóng.',
      'Chúng tôi không chịu trách nhiệm đối với những trường hợp giao hàng chậm trễ hay thất lạc vì các thông tin do quý khách cung cấp không chính xác.',
      'Sản phẩm sẽ được giao đến tay khách hàng trong vòng 3 đến 5 ngày, không tính Chủ Nhật hoặc những ngày Lễ, Tết, kể từ khi đặt hàng. Thời gian này chỉ mang tính chất tương đối.',
      'Các đơn hàng của LAN Perfume được vận chuyển giao đến tay khách hàng luôn có tem niêm phong LAN Perfume ở các mép hộp. Trong trường hợp nhận hàng nhưng tem niêm phong có dấu hiệu bị rạch hoặc không còn nguyên vẹn, quý khách vui lòng quay lại video và liên hệ qua Fanpage @Lanperfumeauth (LAN Perfume) hoặc Instagram lanperfume.official để được hỗ trợ.',
    ],
  },
  {
    id: 'thay-doi-huy-bo-giao-dich',
    title: 'Thay Đổi, Hủy Bỏ Giao Dịch',
    content: ['Trong những trường hợp sau đây quý khách có thể thay đổi hoặc hủy bỏ giao dịch.'],
    items: [
      'Khi cửa hàng đã xác nhận được sản phẩm vẫn chưa được gửi đi.',
      'Nếu sản phẩm đã được gửi đi, có thay đổi khách hàng phải chịu phí ship.',
      'Thông thường sau khi nhận được thông tin đặt hàng, chúng tôi sẽ xử lý đơn hàng trong vòng 24h và phản hồi lại thông tin cho khách hàng về việc thanh toán và giao nhận.',
      'Thời gian giao hàng thường trong khoảng từ 3 đến 5 ngày kể từ ngày chốt đơn hàng hoặc theo thỏa thuận với khách khi đặt hàng.',
      'Việc giao hàng có thể kéo dài hơn trong các tình huống bất khả kháng như chúng tôi liên lạc với khách hàng không được, địa chỉ giao hàng không chính xác hoặc khó tìm, số lượng đơn hàng tăng đột biến, đối tác cung cấp hàng chậm hơn dự kiến, hoặc đối tác vận chuyển giao hàng bị chậm.',
      'Về phí vận chuyển, chúng tôi sử dụng dịch vụ vận chuyển ngoài nên cước phí vận chuyển sẽ được tính theo phí của các đơn vị vận chuyển tùy vào vị trí và khối lượng của đơn hàng. Khi liên hệ lại xác nhận đơn hàng với khách sẽ báo mức phí cụ thể.',
    ],
  },
  {
    id: 'chinh-sach-kiem-hang',
    title: 'Chính sách kiểm hàng',
    content: [
      'LAN Perfume đồng ý cho khách kiểm tra đối với chai Fullseal. Tuy nhiên, quý khách chỉ được mở lớp chống shock bên ngoài ra để kiểm tra bên shop có gửi đúng hàng, đủ hàng đi cho mình hay không.',
      'Quý khách không được bóc seal của chai nước hoa.',
      'Sau khi nhận hàng, trước khi bóc hàng, khách hàng vui lòng quay video trước khi bóc seal để được thực hiện đầy đủ quyền bảo hành của mình như theo cam kết Bảo Hành và Đổi Trả.',
    ],
  },
];

export function PaymentPolicyPage() {
  return <PolicyPageLayout title="Chính sách thanh toán" sections={sections} />;
}

import React from 'react';
import { PolicyPageLayout } from './PolicyPageLayout';

const sections = [
  {
    id: 'thu-thap-thong-tin-ca-nhan',
    title: 'Thu thập thông tin cá nhân',
    content: [
      'Riêng tư của khách hàng vô cùng quan trọng với LAN Perfume, vì thế chúng tôi chỉ sử dụng thông tin cá nhân của Bạn vào những trường hợp nêu ra sau đây.',
      'Bảo vệ dữ liệu là vấn đề của sự tin tưởng và bảo mật danh tính của Bạn vô cùng quan trọng với chúng tôi. Vì thế, chúng tôi chỉ sẽ sử dụng tên và một số thông tin khác của Bạn theo cách được đề ra trong Chính sách Bảo mật này. Chúng tôi chỉ sẽ thu thập những thông tin cần thiết và có liên quan đến giao dịch giữa chúng tôi và Bạn.',
      'Chúng tôi chỉ giữ thông tin của Bạn trong thời gian luật pháp yêu cầu hoặc cho mục đích mà thông tin đó được thu thập.',
      'Bạn có thể ghé thăm trang web mà không cần phải cung cấp bất kỳ thông tin cá nhân nào. Khi ghé thăm trang web, Bạn sẽ luôn ở trong tình trạng vô danh trừ khi Bạn có tài khoản trên trang web và đăng nhập vào bằng tên và mật khẩu của mình.',
      'Nếu Bạn có ý kiến hay đóng góp gì, xin vui lòng gửi email tới lanperfumestore@gmail.com. Chúng tôi luôn sẵn sàng lắng nghe nhận xét của Bạn.',
      'Quy định Bảo mật của chúng tôi hoàn toàn tuân theo Đạo luật Bảo Mật 1988 và là phương châm tốt nhất của nền công nghiệp.',
      'LAN Perfume không bán, chia sẻ hay trao đổi thông tin cá nhân của khách hàng thu thập trên trang web cho một bên thứ ba nào khác.',
      'Thông tin cá nhân thu thập được sẽ chỉ được sử dụng trong nội bộ cửa hàng.',
      'Khi Bạn đăng ký tài khoản, thông tin cá nhân mà chúng tôi thu thập bao gồm Tên, Địa chỉ giao hàng, Địa chỉ Email và Số điện thoại di động.',
    ],
    items: [
      'Giao hàng Bạn đã mua tại LAN Perfume.',
      'Thông báo về việc giao hàng và hỗ trợ khách hàng.',
      'Cung cấp thông tin liên quan đến sản phẩm.',
      'Xử lý đơn đặt hàng và cung cấp dịch vụ và thông tin qua trang web của chúng tôi theo yêu cầu của Bạn.',
      'Hỗ trợ quản lý tài khoản khách hàng; xác nhận và thực hiện các giao dịch tài chính liên quan đến các khoản thanh toán trực tuyến của Bạn.',
      'Kiểm tra dữ liệu tải từ trang web của chúng tôi; cải thiện giao diện hoặc nội dung của các trang mục trên trang web và tùy chỉnh để dễ dàng hơn khi sử dụng.',
      'Nhận diện khách đến thăm trang web; nghiên cứu về nhân khẩu học của người sử dụng; gửi đến Bạn thông tin mà chúng tôi nghĩ sẽ có ích hoặc do Bạn yêu cầu, bao gồm thông tin về sản phẩm và dịch vụ, với điều kiện Bạn đồng ý không phản đối việc được liên lạc cho các mục đích trên.',
      'Chúng tôi có thể chia sẻ tên và địa chỉ của Bạn cho một bên thứ ba để có thể giao hàng cho Bạn, ví dụ như dịch vụ chuyển phát nhanh hoặc nhà cung cấp của chúng tôi.',
      'Khi Bạn đăng ký làm thành viên trên trang web, chúng tôi cũng sẽ sử dụng thông tin cá nhân của Bạn để gửi các thông tin khuyến mãi, tiếp thị. Bạn có thể hủy nhận các thông tin đó bất kỳ lúc nào bằng cách sử dụng chức năng hủy đăng ký trong các thông báo quảng cáo.',
      'Chi tiết đơn hàng của Bạn sẽ được chúng tôi lưu trữ nhưng vì lý do bảo mật, Bạn không thể yêu cầu thông tin đó từ chúng tôi. Tuy nhiên, Bạn có thể kiểm tra thông tin đó bằng cách đăng nhập vào tài khoản riêng của mình trên trang web. Tại đó, Bạn có thể theo dõi đầy đủ chi tiết của các đơn hàng đã hoàn tất, những đơn hàng mở và những đơn hàng sắp được giao cũng như quản lý thông tin về địa chỉ, thông tin về ngân hàng và những bản tin mà Bạn đã đăng ký nhận.',
      'Bạn cần bảo đảm là thông tin được truy cập một cách bí mật và không làm lộ cho một bên thứ ba không có quyền. Chúng tôi sẽ không chịu trách nhiệm đối với việc sử dụng sai mật khẩu trừ khi đó là lỗi của chúng tôi.',
    ],
  },
  {
    id: 'cap-nhat-thong-tin-ca-nhan',
    title: 'Cập nhật thông tin cá nhân',
    content: ['Bạn có thể cập nhật thông tin cá nhân của mình bất kỳ lúc nào bằng cách đăng nhập vào trang web.'],
  },
  {
    id: 'bao-mat-thong-tin-ca-nhan',
    title: 'Bảo mật thông tin cá nhân',
    content: ['LAN Perfume đảm bảo rằng mọi thông tin thu thập được sẽ được lưu giữ an toàn. Chúng tôi bảo vệ thông tin cá nhân của Bạn bằng cách:'],
    items: [
      'Giới hạn truy cập thông tin cá nhân.',
      'Sử dụng sản phẩm công nghệ để ngăn chặn truy cập máy tính trái phép.',
      'Xóa thông tin cá nhân của Bạn khi nó không còn cần thiết cho mục đích lưu trữ hồ sơ của chúng tôi.',
    ],
  },
  {
    id: 'tiet-lo-thong-tin-ca-nhan',
    title: 'Tiết lộ thông tin cá nhân',
    content: [
      'Chúng tôi sẽ không chia sẻ thông tin của Bạn cho bất kỳ một cửa hàng nào khác ngoại trừ những cửa hàng và các bên thứ ba có liên quan trực tiếp đến việc giao hàng mà Bạn đã mua tại LAN Perfume.',
      'Trong một vài trường hợp đặc biệt, LAN Perfume có thể bị yêu cầu phải tiết lộ thông tin cá nhân, ví dụ như khi có căn cứ cho việc tiết lộ thông tin là cần thiết để ngăn chặn các mối đe dọa về tính mạng và sức khỏe, hay cho mục đích thực thi pháp luật.',
      'Nếu Bạn tin rằng bảo mật của Bạn bị LAN Perfume xâm phạm, xin vui lòng nhắn tin cho shop trực tiếp trên web hoặc thông qua email lanperfumestore@gmail.com hoặc gọi hotline 058 950 6666 để được giải quyết vấn đề.',
    ],
  },
  {
    id: 'thay-doi-cua-chinh-sach-bao-mat',
    title: 'Thay đổi của Chính sách Bảo mật',
    content: [
      'LAN Perfume có quyền thay đổi và chỉnh sửa Quy định Bảo mật vào bất kỳ lúc nào. Bất cứ thay đổi nào về chính sách này đều được đăng trên trang web của chúng tôi.',
      'Nếu Bạn không hài lòng với việc chúng tôi xử lý thắc mắc hay khiếu nại của Bạn, xin vui lòng liên hệ với chúng tôi tại lanperfumestore@gmail.com.',
    ],
  },
];

export function PrivacyPolicyPage() {
  return <PolicyPageLayout title="Chính sách bảo mật thông tin" sections={sections} />;
}

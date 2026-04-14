# api/decorators.py
from functools import wraps
from django.http import JsonResponse
from rest_framework import status
from decouple import config


# Admin secret key đọc từ .env — dùng để admin panel bypass session auth
ADMIN_SECRET_KEY = config('ADMIN_SECRET_KEY', default='')


def require_session_auth(view_func):
    """
    Decorator để kiểm tra xem user đã đăng nhập (có trong session) chưa.
    Nếu chưa, trả về lỗi 401.

    Hỗ trợ bypass bằng admin secret key:
        Header: X-Admin-Key: <secret>
    """
    @wraps(view_func)
    def _wrapped_view(request, *args, **kwargs):
        # 1. Cho phép admin panel bypass bằng secret key
        admin_key = request.headers.get('X-Admin-Key', '')
        if ADMIN_SECRET_KEY and admin_key == ADMIN_SECRET_KEY:
            return view_func(request, *args, **kwargs)

        # 2. Kiểm tra session auth cho customer frontend
        if 'user_id' not in request.session:
            return JsonResponse(
                {'error': 'Yêu cầu đăng nhập.'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        # Nếu qua được kiểm tra, gọi hàm view gốc
        return view_func(request, *args, **kwargs)
    return _wrapped_view
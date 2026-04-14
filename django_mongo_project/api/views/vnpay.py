import hashlib
import hmac
import urllib.parse
from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from decouple import config
from mongoengine.errors import DoesNotExist, ValidationError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models.order import Order
from api.services.order_lifecycle_service import cleanup_expired_pending_orders, mark_order_paid, mark_order_payment_failed


def _env_str(name: str, default: str) -> str:
    return str(config(name, default=default))


def _objects(model: Any) -> Any:
    return model.objects


VNPAY_TMN_CODE = _env_str("VNPAY_TMN_CODE", "")
VNPAY_HASH_SECRET = _env_str("VNPAY_HASH_SECRET", "")
VNPAY_PAYMENT_URL = _env_str("VNPAY_PAYMENT_URL", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html")
FRONTEND_URL = _env_str("FRONTEND_URL", "http://localhost:3000")
MIN_PAYMENT_VND = 1000
MAX_PAYMENT_VND = 50000000
VNPAY_EXPIRE_MINUTES = config("VNPAY_EXPIRE_MINUTES", default=30, cast=int)
VNPAY_TIMEZONE = ZoneInfo("Asia/Ho_Chi_Minh")


def _sign_vnpay_params(params: dict[str, str]) -> tuple[str, str]:
    sorted_params = sorted(params.items())
    query_string = urllib.parse.urlencode(sorted_params, quote_via=urllib.parse.quote_plus)
    secure_hash = hmac.new(VNPAY_HASH_SECRET.encode("utf-8"), query_string.encode("utf-8"), hashlib.sha512).hexdigest()
    return secure_hash, query_string


def _resolve_client_ip(request) -> str:
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR", "")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR", "127.0.0.1")


def _validate_amount_range(amount_vnd: int) -> str:
    if amount_vnd < MIN_PAYMENT_VND:
        return f"So tien thanh toan ({amount_vnd:,} VND) nho hon muc toi thieu {MIN_PAYMENT_VND:,} VND."
    if amount_vnd > MAX_PAYMENT_VND:
        return f"So tien thanh toan ({amount_vnd:,} VND) vuot muc toi da {MAX_PAYMENT_VND:,} VND."
    return ""


@api_view(["POST"])
def create_vnpay_payment(request):
    cleanup_expired_pending_orders()
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"error": "Thieu order_id"}, status=status.HTTP_400_BAD_REQUEST)

    if not VNPAY_TMN_CODE or not VNPAY_HASH_SECRET:
        return Response({"error": "Thieu cau hinh VNPAY_TMN_CODE hoac VNPAY_HASH_SECRET"}, status=500)

    try:
        order = _objects(Order).get(id=order_id)
    except (DoesNotExist, ValidationError):
        return Response({"error": "Khong tim thay don hang"}, status=status.HTTP_404_NOT_FOUND)

    amount_vnd = int(float(str(order.total_price)))
    amount_error = _validate_amount_range(amount_vnd)
    if amount_error:
        return Response({"error": amount_error}, status=status.HTTP_400_BAD_REQUEST)

    now = datetime.now(VNPAY_TIMEZONE)
    txn_ref = f"{order_id}_{int(now.timestamp())}"
    expire_at = now + timedelta(minutes=max(VNPAY_EXPIRE_MINUTES, 5))
    vnp_params = {
        "vnp_Version": "2.1.0",
        "vnp_Command": "pay",
        "vnp_TmnCode": VNPAY_TMN_CODE,
        "vnp_Amount": str(amount_vnd * 100),
        "vnp_CurrCode": "VND",
        "vnp_TxnRef": txn_ref,
        "vnp_OrderInfo": f"Thanh toan don hang {str(order_id)[-8:]}",
        "vnp_OrderType": "other",
        "vnp_Locale": "vn",
        "vnp_ReturnUrl": f"{FRONTEND_URL}/vnpay-return",
        "vnp_IpAddr": _resolve_client_ip(request),
        "vnp_CreateDate": now.strftime("%Y%m%d%H%M%S"),
        "vnp_ExpireDate": expire_at.strftime("%Y%m%d%H%M%S"),
    }

    secure_hash, query_string = _sign_vnpay_params(vnp_params)
    pay_url = f"{VNPAY_PAYMENT_URL}?{query_string}&vnp_SecureHash={secure_hash}"
    return Response(
        {
            "payUrl": pay_url,
            "txnRef": txn_ref,
            "amount": amount_vnd,
            "message": "Tao lien ket thanh toan VNPAY thanh cong",
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def confirm_vnpay_payment(request):
    data = {key: str(value) for key, value in request.data.items()}
    received_hash = data.get("vnp_SecureHash")
    if not received_hash:
        return Response({"error": "Thieu chu ky VNPAY"}, status=status.HTTP_400_BAD_REQUEST)

    signed_params = {key: value for key, value in data.items() if key not in ("vnp_SecureHash", "vnp_SecureHashType")}
    calculated_hash, _ = _sign_vnpay_params(signed_params)
    if calculated_hash.lower() != received_hash.lower():
        return Response({"error": "Invalid VNPAY signature"}, status=status.HTTP_400_BAD_REQUEST)

    txn_ref = data.get("vnp_TxnRef", "")
    order_id = txn_ref.rsplit("_", 1)[0] if "_" in txn_ref else txn_ref
    is_success = data.get("vnp_ResponseCode") == "00" and data.get("vnp_TransactionStatus") in ("00", "", "None", None)

    try:
        order = _objects(Order).get(id=order_id)
        if is_success:
            mark_order_paid(order)
        else:
            mark_order_payment_failed(order)
    except (DoesNotExist, ValidationError):
        return Response({"error": "Khong tim thay don hang"}, status=status.HTTP_404_NOT_FOUND)

    return Response(
        {
            "order_id": order_id,
            "payment_status": order.payment_status,
            "response_code": data.get("vnp_ResponseCode", ""),
            "transaction_status": data.get("vnp_TransactionStatus", ""),
        },
        status=status.HTTP_200_OK,
    )

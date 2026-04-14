import hashlib
import hmac
import uuid
from datetime import datetime
from typing import Any

import httpx
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


MOMO_PARTNER_CODE = _env_str("MOMO_PARTNER_CODE", "MOMO")
MOMO_ACCESS_KEY = _env_str("MOMO_ACCESS_KEY", "F8BBA842ECF85")
MOMO_SECRET_KEY = _env_str("MOMO_SECRET_KEY", "K951B6PE1waDMi640xX08PD3vg6EkVlz")
MOMO_ENDPOINT = _env_str("MOMO_ENDPOINT", "https://test-payment.momo.vn/v2/gateway/api/create")
FRONTEND_URL = _env_str("FRONTEND_URL", "http://localhost:3000")
MIN_PAYMENT_VND = 1000
MAX_PAYMENT_VND = 50000000


def _create_signature(raw_signature: str) -> str:
    return hmac.new(MOMO_SECRET_KEY.encode("utf-8"), raw_signature.encode("utf-8"), hashlib.sha256).hexdigest()


def _validate_amount_range(amount_vnd: int) -> str:
    if amount_vnd < MIN_PAYMENT_VND:
        return f"So tien thanh toan ({amount_vnd:,} VND) nho hon muc toi thieu {MIN_PAYMENT_VND:,} VND."
    if amount_vnd > MAX_PAYMENT_VND:
        return f"So tien thanh toan ({amount_vnd:,} VND) vuot muc toi da {MAX_PAYMENT_VND:,} VND."
    return ""


@api_view(["POST"])
def create_momo_payment(request):
    cleanup_expired_pending_orders()
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"error": "Thieu order_id"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = _objects(Order).get(id=order_id)
    except (DoesNotExist, ValidationError):
        return Response({"error": "Khong tim thay don hang"}, status=status.HTTP_404_NOT_FOUND)

    amount_vnd = int(float(str(order.total_price)))
    amount_error = _validate_amount_range(amount_vnd)
    if amount_error:
        return Response({"error": amount_error}, status=status.HTTP_400_BAD_REQUEST)

    request_id = str(uuid.uuid4())
    momo_order_id = f"{order_id}_{int(datetime.now().timestamp())}"
    redirect_url = f"{FRONTEND_URL}/momo-return"
    ipn_url = config("MOMO_IPN_URL", default="https://webhook.site/momo-ipn-placeholder")
    request_type = "payWithMethod"
    extra_data = ""
    order_info = f"Thanh toan don hang {str(order_id)[-8:]}"

    raw_signature = (
        f"accessKey={MOMO_ACCESS_KEY}"
        f"&amount={amount_vnd}"
        f"&extraData={extra_data}"
        f"&ipnUrl={ipn_url}"
        f"&orderId={momo_order_id}"
        f"&orderInfo={order_info}"
        f"&partnerCode={MOMO_PARTNER_CODE}"
        f"&redirectUrl={redirect_url}"
        f"&requestId={request_id}"
        f"&requestType={request_type}"
    )

    payload = {
        "partnerCode": MOMO_PARTNER_CODE,
        "accessKey": MOMO_ACCESS_KEY,
        "requestId": request_id,
        "amount": str(amount_vnd),
        "orderId": momo_order_id,
        "orderInfo": order_info,
        "redirectUrl": redirect_url,
        "ipnUrl": ipn_url,
        "extraData": extra_data,
        "requestType": request_type,
        "autoCapture": True,
        "lang": "vi",
        "signature": _create_signature(raw_signature),
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(str(MOMO_ENDPOINT), json=payload)
        result = response.json()
        if result.get("resultCode") == 0:
            return Response(
                {
                    "payUrl": result["payUrl"],
                    "deeplink": result.get("deeplink", ""),
                    "qrCodeUrl": result.get("qrCodeUrl", ""),
                    "message": result.get("message", ""),
                },
                status=status.HTTP_200_OK,
            )
        mark_order_payment_failed(order)
        return Response({"error": result.get("message", "MoMo tra ve loi"), "momo_result": result}, status=400)
    except httpx.TimeoutException:
        return Response({"error": "MoMo timeout. Vui long thu lai."}, status=status.HTTP_504_GATEWAY_TIMEOUT)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def _verify_momo_signature(data: dict[str, Any]) -> bool:
    raw_signature = (
        f"accessKey={MOMO_ACCESS_KEY}"
        f"&amount={data.get('amount', '')}"
        f"&extraData={data.get('extraData', '')}"
        f"&message={data.get('message', '')}"
        f"&orderId={data.get('orderId', '')}"
        f"&orderInfo={data.get('orderInfo', '')}"
        f"&orderType={data.get('orderType', '')}"
        f"&partnerCode={data.get('partnerCode', '')}"
        f"&payType={data.get('payType', '')}"
        f"&requestId={data.get('requestId', '')}"
        f"&responseTime={data.get('responseTime', '')}"
        f"&resultCode={data.get('resultCode', '')}"
        f"&transId={data.get('transId', '')}"
    )
    return data.get("signature") == _create_signature(raw_signature)


def _resolve_momo_order(data: dict[str, Any]) -> Order:
    momo_order_id = data.get("orderId", "")
    original_order_id = momo_order_id.rsplit("_", 1)[0] if "_" in momo_order_id else momo_order_id
    return _objects(Order).get(id=original_order_id)


@api_view(["POST"])
def momo_ipn(request):
    data = request.data
    if not _verify_momo_signature(data):
        return Response({"message": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = _resolve_momo_order(data)
        if str(data.get("resultCode")) == "0":
            mark_order_paid(order)
        else:
            mark_order_payment_failed(order)
    except Exception:
        pass

    return Response({"message": "ok"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def confirm_momo_payment(request):
    data = request.data
    if not _verify_momo_signature(data):
        return Response({"error": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        order = _resolve_momo_order(data)
        if int(data.get("resultCode", -1)) == 0:
            mark_order_paid(order)
        else:
            mark_order_payment_failed(order)
        return Response({"payment_status": order.payment_status}, status=status.HTTP_200_OK)
    except (DoesNotExist, ValidationError):
        return Response({"error": "Khong tim thay don hang"}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET"])
def get_payment_status(request, order_id):
    cleanup_expired_pending_orders()
    try:
        order = _objects(Order).get(id=order_id)
        return Response(
            {
                "order_id": str(order.id),
                "payment_status": order.payment_status,
                "payment_method": order.payment_method,
                "status": order.status,
            },
            status=status.HTTP_200_OK,
        )
    except (DoesNotExist, ValidationError):
        return Response({"error": "Khong tim thay don hang"}, status=status.HTTP_404_NOT_FOUND)

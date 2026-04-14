from typing import Any

from mongoengine.errors import DoesNotExist, ValidationError
from mongoengine.queryset.visitor import Q
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models.customer import Customer
from api.models.order import Order
from api.models.review import Review
from api.serializers.order import CreateOrderSerializer, OrderDetailSerializer, OrderSerializer
from api.serializers.review import ReviewSerializer
from api.services.order_lifecycle_service import (
    OrderLifecycleError,
    calculate_total,
    cleanup_expired_pending_orders,
    deduct_stock_for_order,
)


def _objects(model: Any) -> Any:
    return model.objects


def _visible_orders():
    cleanup_expired_pending_orders()
    return _objects(Order).all()


@api_view(["GET"])
def get_all_reviews(request):
    try:
        reviews = _objects(Review).all().order_by("-created_at")
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_orders_by_customer(request, customer_id):
    try:
        orders = _visible_orders().filter(customer=customer_id).order_by("-created_at")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
def get_order_detail(request, order_id):
    try:
        order = _visible_orders().get(id=order_id)
        serializer = OrderDetailSerializer(order, many=False)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except DoesNotExist:
        return Response({"error": "Khong tim thay don hang."}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError:
        return Response({"error": "ID don hang khong hop le."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
def create_order(request):
    customer_id = request.data.get("customer")
    if not customer_id:
        return Response({"error": "Thieu thong tin customer trong yeu cau."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        customer = _objects(Customer).get(id=customer_id)
    except DoesNotExist:
        return Response({"error": f"Khong tim thay khach hang voi ID: {customer_id}"}, status=status.HTTP_404_NOT_FOUND)

    order_data = request.data.copy()
    order_data.pop("customer", None)
    serializer = CreateOrderSerializer(data=order_data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    validated_data = serializer.validated_data
    order_items = validated_data.get("items", [])
    total_price = calculate_total(order_items)
    payment_method = validated_data.get("payment_method")

    try:
        order = _objects(Order).create(
            customer=customer,
            items=order_items,
            total_price=total_price,
            payment_method=payment_method,
            payment_status="pending",
            shipping_address=validated_data.get("shipping_address"),
            city=validated_data.get("city"),
            province=validated_data.get("province"),
            postal_code=validated_data.get("postal_code"),
            phone=validated_data.get("phone"),
            status="Cho Xac Nhan" if payment_method == "cod" else "Cho Thanh Toan",
        )

        response_serializer = OrderDetailSerializer(order)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    except OrderLifecycleError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(
            {"error": "Da xay ra loi khi tao don hang. Vui long thu lai."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
def get_all_orders(request):
    try:
        orders = _visible_orders().no_dereference().all()
        serializer = OrderDetailSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PUT", "PATCH"])
def update_order_status(request, order_id):
    new_status = request.data.get("status")
    if not new_status:
        return Response({"error": "Thieu thong tin status trong yeu cau."}, status=status.HTTP_400_BAD_REQUEST)

    valid_statuses = ["Cho Xac Nhan", "Dang Xu Ly", "Dang Van Chuyen", "Da Giao", "Da Huy"]
    if new_status not in valid_statuses:
        return Response(
            {"error": f"Trang thai khong hop le. Cac trang thai hop le: {', '.join(valid_statuses)}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        order = _objects(Order).get(id=order_id)
        previous_status = order.status
        order.status = new_status

        if new_status in ("Dang Xu Ly", "Dang Van Chuyen", "Da Giao") and previous_status in ("Cho Xac Nhan", "Cho Thanh Toan"):
            if order.payment_method == "cod":
                deduct_stock_for_order(order)

        if new_status == "Da Giao" and order.payment_method == "cod":
            order.payment_status = "paid"
        elif new_status == "Da Huy" and order.payment_status == "pending":
            order.payment_status = "failed"

        order.save()
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except DoesNotExist:
        return Response({"error": "Khong tim thay don hang."}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError:
        return Response({"error": "ID don hang khong hop le."}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

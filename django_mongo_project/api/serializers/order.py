# api/serializers/order.py
from typing import Any

from rest_framework import serializers

from api.models.customer import Customer
from api.models.order import Order
from api.serializers.customer import CustomerSerializer
from api.services.order_lifecycle_service import OrderLifecycleError, build_order_item


def _objects(model: Any) -> Any:
    return model.objects


def _extract_unit_price(item: Any) -> float:
    unit_price = getattr(item, "unit_price", None)
    if unit_price is not None:
        return float(unit_price)
    legacy_price = getattr(item, "price", None)
    if legacy_price is not None:
        return float(legacy_price)
    return 0.0


class OrderItemSerializer(serializers.Serializer):
    product = serializers.SerializerMethodField()
    product_id = serializers.SerializerMethodField()
    product_name = serializers.SerializerMethodField()
    product_image = serializers.SerializerMethodField()
    variant_size_ml = serializers.SerializerMethodField()
    variant_label = serializers.SerializerMethodField()
    quantity = serializers.IntegerField()
    price = serializers.SerializerMethodField()

    def get_product(self, obj):
        return str(getattr(obj, "product_id", "") or "")

    def get_product_id(self, obj):
        return str(getattr(obj, "product_id", "") or "")

    def get_product_name(self, obj):
        return getattr(obj, "product_name", "") or ""

    def get_product_image(self, obj):
        return getattr(obj, "product_image", "") or ""

    def get_variant_size_ml(self, obj):
        return getattr(obj, "variant_size_ml", None)

    def get_variant_label(self, obj):
        return getattr(obj, "variant_label", "") or ""

    def get_price(self, obj):
        return _extract_unit_price(obj)


class OrderSerializer(serializers.Serializer):
    id = serializers.SerializerMethodField()
    customer = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    status = serializers.CharField()
    payment_method = serializers.CharField()
    payment_status = serializers.CharField()
    shipping_address = serializers.CharField()
    city = serializers.CharField()
    province = serializers.CharField()
    postal_code = serializers.CharField()
    phone = serializers.CharField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()

    def get_id(self, obj):
        return str(obj.id)

    def get_customer(self, obj) -> Any:
        return str(obj.customer.id)

    def get_total_price(self, obj):
        return float(obj.total_price)


class OrderDetailSerializer(OrderSerializer):
    customer = serializers.SerializerMethodField()

    def get_customer(self, obj) -> Any:
        try:
            customer_ref = getattr(obj, "customer", None)
            customer_id = getattr(customer_ref, "id", customer_ref)
            customer_instance = _objects(Customer)(id=customer_id).first()
            if not customer_instance:
                return {
                    "id": str(customer_id),
                    "email": "Khach hang khong ton tai",
                    "name": "Khach hang khong ton tai",
                }
            serializer = CustomerSerializer(customer_instance)
            return serializer.data
        except Exception:
            return {
                "id": "Khong xac dinh",
                "email": "Loi khi truy xuat khach hang",
                "name": "Loi khi truy xuat khach hang",
            }


class CreateOrderSerializer(serializers.Serializer):
    items = serializers.ListField(child=serializers.DictField(), write_only=True, required=True)
    shipping_address = serializers.CharField(max_length=255, required=True)
    city = serializers.CharField(max_length=100, required=True)
    province = serializers.CharField(max_length=100, required=True)
    postal_code = serializers.CharField(max_length=20, required=True)
    phone = serializers.CharField(max_length=20, required=True)
    payment_method = serializers.ChoiceField(choices=["cod", "momo", "vnpay"], required=True)

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("Don hang phai co it nhat mot san pham.")

        validated_items = []
        for item in items:
            product_id = item.get("product_id") or item.get("product")
            if not product_id:
                raise serializers.ValidationError("Moi san pham phai co product_id.")

            try:
                quantity = int(item.get("quantity"))
            except (TypeError, ValueError):
                raise serializers.ValidationError(f"So luong cho san pham {product_id} phai la mot so nguyen.")

            if quantity <= 0:
                raise serializers.ValidationError(f"So luong cho san pham {product_id} phai lon hon 0.")

            variant_size_ml = item.get("variant_size_ml")
            if variant_size_ml in ("", None):
                variant_size_ml = None
            else:
                try:
                    variant_size_ml = int(variant_size_ml)
                except (TypeError, ValueError):
                    raise serializers.ValidationError(f"Dung tich chiet cho san pham {product_id} khong hop le.")

            try:
                validated_items.append(build_order_item(str(product_id), quantity, variant_size_ml))
            except OrderLifecycleError as exc:
                raise serializers.ValidationError(str(exc)) from exc

        return validated_items

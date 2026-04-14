from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from decouple import config
from mongoengine.errors import DoesNotExist, ValidationError

from api.models.order import Order, OrderItem
from api.models.product import Product
from api.models.productdetail import ProductDetail
from api.models.productvariant import ProductVariant
from api.services.inventory_service import sync_product_inventory


def _objects(model: Any) -> Any:
    return model.objects


class OrderLifecycleError(Exception):
    pass


PENDING_PAYMENT_EXPIRE_MINUTES = config("PENDING_PAYMENT_EXPIRE_MINUTES", default=30, cast=int)


def resolve_variant(product_id: str, variant_size_ml: int | None) -> ProductVariant | None:
    if variant_size_ml is None:
        return _objects(ProductVariant)(product=product_id, is_default=True, is_active=True).first() or _objects(
            ProductVariant
        )(product=product_id, is_active=True).first()

    return _objects(ProductVariant)(product=product_id, size_ml=variant_size_ml, is_active=True).first()


def build_order_item(product_id: str, quantity: int, variant_size_ml: int | None) -> OrderItem:
    try:
        product = _objects(Product).get(id=product_id)
    except (DoesNotExist, ValidationError):
        raise OrderLifecycleError(f"San pham voi ID {product_id} khong ton tai.")

    variant = resolve_variant(product_id, variant_size_ml)
    if not variant:
        raise OrderLifecycleError(f"Khong tim thay bien the phu hop cho san pham {product.name}.")

    detail = _objects(ProductDetail)(product=product).first()
    product_image = product.main_image or product.image
    in_stock = bool(detail.inStock) if detail is not None else True

    if not in_stock or variant.stock_quantity < quantity:
        raise OrderLifecycleError(
            f"San pham {product.name} chi con {variant.stock_quantity} chai/size trong kho."
        )

    return OrderItem(
        product_id=str(product.id),
        product_name=product.name,
        product_image=product_image,
        variant_size_ml=variant.size_ml,
        variant_label=f"{variant.size_ml}ml",
        quantity=quantity,
        unit_price=variant.price,
    )


def calculate_total(items: list[OrderItem]) -> float:
    return sum(float(item.unit_price or 0) * item.quantity for item in items)


def deduct_stock_for_order(order: Order) -> None:
    if order.stock_deducted:
        return

    touched_variants: list[tuple[ProductVariant, int]] = []

    try:
        for item in order.items:
            variant = resolve_variant(item.product_id or "", getattr(item, "variant_size_ml", None))
            if not variant:
                raise OrderLifecycleError(f"Khong tim thay bien the de tru kho cho san pham {item.product_name or item.product_id}.")
            if variant.stock_quantity < item.quantity:
                raise OrderLifecycleError(
                    f"Ton kho khong du cho {item.product_name or item.product_id} {getattr(item, 'variant_label', '')}."
                )
            variant.stock_quantity -= item.quantity
            variant.save()
            touched_variants.append((variant, item.quantity))

        order.stock_deducted = True
        order.save()
        refresh_product_stock_flags(order)
    except Exception as exc:
        for variant, qty in touched_variants:
            variant.stock_quantity += qty
            variant.save()
        raise OrderLifecycleError(str(exc)) from exc


def refresh_product_stock_flags(order: Order) -> None:
    product_ids = {item.product_id for item in order.items if item.product_id}
    for product_id in product_ids:
        product = _objects(Product)(id=product_id).first()
        if not product:
            continue
        sync_product_inventory(product)


def mark_order_payment_failed(order: Order) -> None:
    order.payment_status = "failed"
    order.status = "Da Huy"
    order.save()


def mark_order_paid(order: Order) -> None:
    order.payment_status = "paid"
    if order.status == "Cho Thanh Toan":
        order.status = "Cho Xac Nhan"
    order.save()
    if order.payment_method != "cod":
        deduct_stock_for_order(order)


def cleanup_expired_pending_orders() -> int:
    threshold = datetime.utcnow() - timedelta(minutes=max(PENDING_PAYMENT_EXPIRE_MINUTES, 5))
    expired_orders = _objects(Order)(
        payment_method__ne="cod",
        payment_status="pending",
        created_at__lte=threshold,
    )

    cleaned = 0
    for order in expired_orders:
      mark_order_payment_failed(order)
      cleaned += 1
    return cleaned

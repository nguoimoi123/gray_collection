from __future__ import annotations

from typing import Any, Iterable

from api.models.product import Product
from api.models.productdetail import ProductDetail
from api.models.productvariant import ProductVariant


def _objects(model: Any) -> Any:
    return model.objects


def compute_product_in_stock(product: Product) -> bool:
    return _objects(ProductVariant)(product=product, is_active=True, stock_quantity__gt=0).count() > 0


def sync_product_inventory(product: Product) -> bool:
    has_stock = compute_product_in_stock(product)
    detail = _objects(ProductDetail)(product=product).first()

    if detail and detail.inStock != has_stock:
        detail.inStock = has_stock
        detail.save()

    return has_stock


def sync_products_inventory(products: Iterable[Product]) -> None:
    for product in products:
        sync_product_inventory(product)

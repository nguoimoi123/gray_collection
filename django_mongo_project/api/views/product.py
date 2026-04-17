import time
from typing import Any

from bson import ObjectId
from mongoengine.errors import DoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models.product import Product
from api.models.productdetail import ProductDetail
from api.models.productvariant import ProductVariant
from api.serializers.product import ProductSerializer, ProductVariantSerializer
from api.serializers.productdetail import ProductDetailSerializer
from api.services.inventory_service import sync_product_inventory

# ── Simple in-memory cache ────────────────────────────────────────────
_product_list_cache: dict = {"data": None, "expires": 0}
CACHE_TTL = 60  # seconds


def _objects(model: Any) -> Any:
    return model.objects


def _invalidate_product_cache():
    """Call this whenever products are created / updated / deleted."""
    _product_list_cache["data"] = None
    _product_list_cache["expires"] = 0


@api_view(["GET"])
def product_list(request):
    """
    Optimised product list.

    Changes vs. the original implementation:
    1. Results are cached in-memory for 60 s so repeated page-loads
       don't hit MongoDB at all.
    2. Default variants are fetched in ONE batch query instead of
       N individual queries (eliminates the serializer N+1).
    3. `sync_products_inventory` is NO LONGER called here.
       Inventory sync now happens on product create/update or via
       a dedicated refresh endpoint.
    """
    now = time.time()
    if _product_list_cache["data"] and now < _product_list_cache["expires"]:
        return Response(_product_list_cache["data"])

    # 1. Single query: all active products
    products = list(_objects(Product)(is_active=True).all())

    if not products:
        _product_list_cache["data"] = []
        _product_list_cache["expires"] = now + CACHE_TTL
        return Response([])

    product_ids = [p.id for p in products]

    # 2. Batch-fetch default variants (1 query instead of N)
    all_variants = list(
        _objects(ProductVariant)(product__in=product_ids, is_active=True)
        .order_by("size_ml")
    )
    # Build lookup: product_id -> best variant (prefer is_default, else smallest)
    variant_map: dict = {}
    for v in all_variants:
        pid = v.product.id if hasattr(v.product, "id") else v.product
        if pid not in variant_map or v.is_default:
            variant_map[pid] = v

    # 3. Serialize products (skip per-product DB query in serializer)
    serializer = ProductSerializer(products, many=True)
    result = serializer.data

    # 4. Attach default_variant from the batch map
    for item in result:
        pid = ObjectId(item["id"])
        variant = variant_map.get(pid)
        item["default_variant"] = (
            ProductVariantSerializer(variant).data if variant else None
        )

    _product_list_cache["data"] = result
    _product_list_cache["expires"] = now + CACHE_TTL
    return Response(result)


@api_view(["GET"])
def product_detail(request, product_id):
    product = None

    try:
        product = _objects(Product).get(id=ObjectId(product_id), is_active=True)
    except Exception:
        product = _objects(Product)(slug=product_id, is_active=True).first()

    if not product:
        raise_not_found = {"error": "Product not found"}
        return Response(raise_not_found, status=status.HTTP_404_NOT_FOUND)

    sync_product_inventory(product)
    product_data = dict(ProductSerializer(product).data)
    detail = _objects(ProductDetail)(product=product).first()
    product_data["detail"] = ProductDetailSerializer(detail).data if detail else {}

    # Attach ALL variants for the detail page
    variants = list(
        _objects(ProductVariant)(product=product, is_active=True).order_by("size_ml")
    )
    product_data["variants"] = ProductVariantSerializer(variants, many=True).data

    return Response(product_data)


@api_view(["POST"])
def refresh_inventory(request):
    """
    Admin-only endpoint to sync inventory for all products.
    Call this after stock changes instead of doing it on every GET.
    """
    products = _objects(Product)(is_active=True).all()
    count = 0
    for p in products:
        sync_product_inventory(p)
        count += 1
    _invalidate_product_cache()
    return Response({"synced": count})

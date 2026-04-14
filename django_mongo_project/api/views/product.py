from typing import Any

from bson import ObjectId
from mongoengine.errors import DoesNotExist
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models.product import Product
from api.models.productdetail import ProductDetail
from api.serializers.product import ProductSerializer
from api.serializers.productdetail import ProductDetailSerializer
from api.services.inventory_service import sync_product_inventory, sync_products_inventory


def _objects(model: Any) -> Any:
    return model.objects


@api_view(["GET"])
def product_list(request):
    products = _objects(Product)(is_active=True).all()
    sync_products_inventory(products)
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data)


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
    return Response(product_data)

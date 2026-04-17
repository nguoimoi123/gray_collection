from rest_framework_mongoengine import serializers as me_serializers

from api.models.product import Product
from api.models.productvariant import ProductVariant


class ProductVariantSerializer(me_serializers.DocumentSerializer):
    class Meta:
        model = ProductVariant
        fields = "__all__"


class ProductSerializer(me_serializers.DocumentSerializer):
    """
    Product serializer — default_variant is injected by the view layer
    via batch prefetch to avoid N+1 queries.
    """

    class Meta:
        model = Product
        fields = "__all__"


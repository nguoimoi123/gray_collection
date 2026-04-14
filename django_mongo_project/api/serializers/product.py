from rest_framework import serializers
from rest_framework_mongoengine import serializers as me_serializers

from api.models.product import Product
from api.models.productvariant import ProductVariant


class ProductVariantSerializer(me_serializers.DocumentSerializer):
    class Meta:
        model = ProductVariant
        fields = "__all__"


class ProductSerializer(me_serializers.DocumentSerializer):
    default_variant = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_default_variant(self, obj):
        variant = (
            ProductVariant.objects(product=obj, is_default=True).first()
            or ProductVariant.objects(product=obj, is_active=True).order_by("size_ml").first()
        )
        if not variant:
            return None
        return ProductVariantSerializer(variant).data

from rest_framework import serializers
from rest_framework_mongoengine import serializers as me_serializers

from api.models.productdetail import ProductDetail
from api.models.productvariant import ProductVariant
from api.serializers.product import ProductVariantSerializer


class ProductDetailSerializer(me_serializers.DocumentSerializer):
    variants = serializers.SerializerMethodField()

    class Meta:
        model = ProductDetail
        fields = "__all__"

    def get_variants(self, obj):
        variants = ProductVariant.objects(product=obj.product, is_active=True).order_by("size_ml")
        return ProductVariantSerializer(variants, many=True).data

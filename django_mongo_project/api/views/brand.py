from typing import Any

from bson import ObjectId
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.models.brand import Brand
from api.serializers.brand import BrandSerializer


def _objects(model: Any) -> Any:
    return model.objects


def _get_brand_or_response(brand_id: str):
    if not ObjectId.is_valid(brand_id):
        return None, Response({'error': 'ID thuong hieu khong hop le.'}, status=status.HTTP_400_BAD_REQUEST)

    brand = _objects(Brand)(id=brand_id).first()
    if not brand:
        return None, Response({'error': 'Khong tim thay thuong hieu.'}, status=status.HTTP_404_NOT_FOUND)

    return brand, None


@api_view(['GET', 'POST'])
def brand_list(request):
    if request.method == 'GET':
        brands = _objects(Brand).all()
        serializer = BrandSerializer(brands, many=True)
        return Response(serializer.data)

    name = (request.data.get('name') or '').strip()
    if not name:
        return Response({'error': 'Vui long nhap ten thuong hieu.'}, status=status.HTTP_400_BAD_REQUEST)

    existing_brand = _objects(Brand)(name__iexact=name).first()
    if existing_brand:
        serializer = BrandSerializer(existing_brand)
        return Response(
            {'error': 'Thuong hieu da ton tai.', 'brand': serializer.data},
            status=status.HTTP_409_CONFLICT,
        )

    brand = Brand(name=name)
    brand.save()
    serializer = BrandSerializer(brand)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH', 'DELETE'])
def brand_detail(request, brand_id: str):
    brand, error_response = _get_brand_or_response(brand_id)
    if error_response:
        return error_response

    if request.method == 'PATCH':
        name = (request.data.get('name') or '').strip()
        if not name:
            return Response({'error': 'Vui long nhap ten thuong hieu.'}, status=status.HTTP_400_BAD_REQUEST)

        existing_brand = _objects(Brand)(name__iexact=name).first()
        if existing_brand and str(existing_brand.id) != str(brand.id):
            serializer = BrandSerializer(existing_brand)
            return Response(
                {'error': 'Thuong hieu da ton tai.', 'brand': serializer.data},
                status=status.HTTP_409_CONFLICT,
            )

        brand.name = name
        brand.save()
        serializer = BrandSerializer(brand)
        return Response(serializer.data, status=status.HTTP_200_OK)

    brand.delete()
    return Response({'message': 'Xoa thuong hieu thanh cong.'}, status=status.HTTP_200_OK)

from typing import Any

from django.contrib.auth.hashers import check_password, make_password
from mongoengine.errors import DoesNotExist, ValidationError
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.decorators.decorators import require_session_auth
from api.models.customer import Customer
from api.serializers.customer import CustomerSerializer


def _objects(model: Any) -> Any:
    return model.objects


def _is_hashed_password(value: str) -> bool:
    return value.startswith("pbkdf2_") or value.startswith("argon2") or value.startswith("bcrypt")


def _verify_customer_password(customer: Customer, raw_password: str) -> bool:
    stored_password = getattr(customer, "password", "") or ""
    if not stored_password:
        return False

    if _is_hashed_password(stored_password):
        return check_password(raw_password, stored_password)

    if raw_password == stored_password:
        customer.password = make_password(raw_password)
        customer.save()
        return True

    return False


@api_view(["POST"])
def api_register(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    first_name = (request.data.get("first_name") or "").strip()

    if not email or not password:
        return Response({"error": "Vui long cung cap ca email va mat khau."}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({"error": "Mat khau can it nhat 6 ky tu."}, status=status.HTTP_400_BAD_REQUEST)

    if _objects(Customer)(email=email).first():
        return Response({"error": "Email nay da duoc su dung."}, status=status.HTTP_409_CONFLICT)

    try:
        customer = Customer(
            email=email,
            password=make_password(password),
            first_name=first_name,
            last_name=(request.data.get("last_name") or "").strip(),
            phone=(request.data.get("phone") or "").strip(),
            address=(request.data.get("address") or "").strip(),
            city=(request.data.get("city") or "").strip(),
            province=(request.data.get("province") or "").strip(),
            postal_code=(request.data.get("postal_code") or "").strip(),
        )
        customer.save()
        request.session["user_id"] = str(customer.id)
        request.session["user_email"] = customer.email

        return Response({"message": "User registered successfully", "id": str(customer.id)}, status=status.HTTP_201_CREATED)
    except Exception as exc:
        return Response(
            {"error": "Da co loi xay ra.", "details": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
def api_login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""

    if not email or not password:
        return Response({"error": "Vui long cung cap ca email va mat khau."}, status=status.HTTP_400_BAD_REQUEST)

    customer = _objects(Customer)(email=email).first()
    if not customer or not _verify_customer_password(customer, password):
        return Response({"error": "Email hoac mat khau khong chinh xac."}, status=status.HTTP_401_UNAUTHORIZED)

    request.session["user_id"] = str(customer.id)
    request.session["user_email"] = customer.email

    return Response(
        {"message": "Login successful", "id": str(customer.id), "role": "customer"},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@require_session_auth
def api_logout(request):
    request.session.flush()
    return Response({"message": "Dang xuat thanh cong."}, status=status.HTTP_200_OK)


@api_view(["GET"])
@require_session_auth
def get_session_customer(request):
    user_id = request.session.get("user_id")
    if not user_id:
        return Response({"error": "Session khong hop le."}, status=status.HTTP_401_UNAUTHORIZED)

    customer = _objects(Customer)(id=user_id).first()
    if not customer:
        request.session.flush()
        return Response({"error": "Khong tim thay khach hang."}, status=status.HTTP_404_NOT_FOUND)

    serializer = CustomerSerializer(customer)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@require_session_auth
def get_customer(request, customer_id):
    try:
        customer = _objects(Customer).get(id=customer_id)
        serializer = CustomerSerializer(customer)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except DoesNotExist:
        return Response({"error": "Khong tim thay khach hang."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["PATCH"])
@require_session_auth
def update_customer(request, customer_id):
    try:
        customer = _objects(Customer).get(id=customer_id)
        serializer = CustomerSerializer(instance=customer, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Profile updated successfully", "customer": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response({"error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
    except DoesNotExist:
        return Response({"error": "Khong tim thay khach hang voi ID nay."}, status=status.HTTP_404_NOT_FOUND)
    except ValidationError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response({"error": str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@require_session_auth
def get_all_customers(request):
    try:
        city = request.query_params.get("city")
        province = request.query_params.get("province")

        customers = _objects(Customer).all()
        if city:
            customers = customers.filter(city__icontains=city)
        if province:
            customers = customers.filter(province__icontains=province)

        serializer = CustomerSerializer(customers, many=True)
        return Response({"customers": serializer.data, "count": len(serializer.data)}, status=status.HTTP_200_OK)
    except Exception as exc:
        return Response(
            {"error": "Da co loi xay ra khi lay danh sach khach hang.", "details": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

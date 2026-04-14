import json
from typing import Any

from decouple import config
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google.auth.transport import requests
from google.oauth2 import id_token

from api.models.customer import Customer


def _objects(model: Any) -> Any:
    return model.objects


GOOGLE_CLIENT_ID = config("GOOGLE_CLIENT_ID", default="")


@csrf_exempt
def google_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    try:
        data = json.loads(request.body)
        credential = data.get("credential")
        if not credential:
            return JsonResponse({"error": "Missing credential"}, status=400)

        idinfo = id_token.verify_oauth2_token(credential, requests.Request(), GOOGLE_CLIENT_ID)
        email = str(idinfo["email"]).strip().lower()
        given_name = idinfo.get("given_name", "") or idinfo.get("name", "")
        family_name = idinfo.get("family_name", "")

        customer = _objects(Customer)(email=email).first()
        if not customer:
            customer = Customer(
                email=email,
                password=make_password("google_oauth"),
                first_name=given_name,
                last_name=family_name,
                phone="",
                address="",
                city="",
                province="",
                postal_code="",
            )
            customer.save()

        request.session["user_id"] = str(customer.id)
        request.session["user_email"] = customer.email

        return JsonResponse({"message": "Login successful", "id": str(customer.id), "role": "customer"})
    except ValueError as exc:
        return JsonResponse({"error": "Invalid token", "details": str(exc)}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as exc:
        return JsonResponse({"error": str(exc)}, status=500)

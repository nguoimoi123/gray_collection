import json
import logging
from typing import Any

from decouple import config
from django.contrib.auth.hashers import make_password
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from google.auth.transport import requests
from google.oauth2 import id_token

from api.models.customer import Customer

logger = logging.getLogger(__name__)


def _objects(model: Any) -> Any:
    return model.objects


GOOGLE_CLIENT_ID = config("GOOGLE_CLIENT_ID", default="")


@csrf_exempt
def google_login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)

    # Fail fast nếu GOOGLE_CLIENT_ID chưa được cấu hình
    if not GOOGLE_CLIENT_ID:
        logger.error("GOOGLE_CLIENT_ID is not configured on the server.")
        return JsonResponse(
            {"error": "Google login is not configured on this server."},
            status=500,
        )

    try:
        data = json.loads(request.body)
        credential = data.get("credential")
        if not credential:
            return JsonResponse({"error": "Missing credential"}, status=400)

        logger.info("Verifying Google token with client_id=%s...", GOOGLE_CLIENT_ID[:20])
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
            logger.info("Created new Google customer: %s", email)

        request.session["user_id"] = str(customer.id)
        request.session["user_email"] = customer.email

        return JsonResponse({"message": "Login successful", "id": str(customer.id), "role": "customer"})
    except ValueError as exc:
        logger.warning("Google token verification failed: %s", exc)
        return JsonResponse({"error": "Invalid token", "details": str(exc)}, status=401)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as exc:
        logger.exception("Unexpected error in google_login: %s", exc)
        return JsonResponse({"error": str(exc)}, status=500)

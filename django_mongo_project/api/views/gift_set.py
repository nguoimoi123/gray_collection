from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from api.services.gift_set_service import (
    create_gift_set,
    delete_gift_set,
    get_gift_set,
    list_gift_sets,
    update_gift_set,
)


@api_view(["GET", "POST"])
def gift_set_list(request):
    if request.method == "GET":
        active_only = str(request.query_params.get("active", "")).lower() in {"1", "true", "yes"}
        return Response(list_gift_sets(active_only=active_only))

    try:
        created = create_gift_set(request.data or {})
    except ValueError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(created, status=status.HTTP_201_CREATED)


@api_view(["GET", "PUT", "PATCH", "DELETE"])
def gift_set_detail(request, gift_set_id):
    if request.method == "GET":
        gift_set = get_gift_set(gift_set_id)
        if not gift_set:
            return Response({"error": "Gift set not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(gift_set)

    if request.method == "DELETE":
        deleted = delete_gift_set(gift_set_id)
        if not deleted:
            return Response({"error": "Gift set not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    try:
        updated = update_gift_set(gift_set_id, request.data or {})
    except ValueError as exc:
        return Response({"error": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

    if not updated:
        return Response({"error": "Gift set not found."}, status=status.HTTP_404_NOT_FOUND)

    return Response(updated)

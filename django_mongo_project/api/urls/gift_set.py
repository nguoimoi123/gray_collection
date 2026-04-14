from django.urls import path

from api.views.gift_set import gift_set_detail, gift_set_list

urlpatterns = [
    path("", gift_set_list, name="gift_set_list"),
    path("<str:gift_set_id>/", gift_set_detail, name="gift_set_detail"),
]

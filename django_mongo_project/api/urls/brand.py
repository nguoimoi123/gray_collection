from django.urls import path

from api.views.brand import brand_detail, brand_list

urlpatterns = [
    path('', brand_list, name='brand_list'),
    path('<str:brand_id>/', brand_detail, name='brand_detail'),
]

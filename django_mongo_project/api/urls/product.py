from django.urls import path
from api.views.product import product_list, product_detail, refresh_inventory

urlpatterns = [
    path('', product_list, name='product_list'),
    path('refresh-inventory/', refresh_inventory, name='refresh_inventory'),
    path('<str:product_id>/', product_detail, name='product_detail'),
]

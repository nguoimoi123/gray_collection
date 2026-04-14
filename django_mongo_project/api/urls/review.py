from django.urls import path
from api.views.review import *
from api.views.order import get_all_reviews
from api.views.admin_response import (
    add_admin_response,
    delete_admin_response,
    generate_ai_response,
    get_admin_responses,
    get_public_admin_responses,
    update_admin_response,
)

urlpatterns = [    
    path('all/', get_all_reviews, name='get_all_reviews'),
    path('get_by_id/<str:product_id>/', get_reviews_by_product_id, name='get_reviews_by_product_id'),
    path('add/', add_review_with_session, name='add_review_with_session'),
    path('<str:review_id>/responses/', get_public_admin_responses, name='get_public_admin_responses'),
    path('<str:review_id>/responses/admin/', get_admin_responses, name='get_admin_responses'),
    path('responses/add/', add_admin_response, name='add_admin_response'),
    path('responses/generate-ai/', generate_ai_response, name='generate_ai_response'),
    path('responses/<str:response_id>/update/', update_admin_response, name='update_admin_response'),
    path('responses/<str:response_id>/delete/', delete_admin_response, name='delete_admin_response'),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.transaction_type.apis.views import TransactionTypeViewSet

transaction_type_router = DefaultRouter()
transaction_type_router.register(r'', TransactionTypeViewSet, basename='transaction-type')

urlpatterns = [
    path('', include(transaction_type_router.urls)),
]

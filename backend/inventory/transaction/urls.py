from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.transaction.apis.views import InventoryTransactionViewSet

transaction_router = DefaultRouter()
transaction_router.register(r'', InventoryTransactionViewSet, basename='transaction')

urlpatterns = [
    path('', include(transaction_router.urls)),
]

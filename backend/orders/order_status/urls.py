from django.urls import include, path
from rest_framework.routers import DefaultRouter

from orders.order_status.apis.views import OrderStatusViewSet

router = DefaultRouter()
router.register(r'', OrderStatusViewSet, basename='order-status')

urlpatterns = [
    path('', include(router.urls)),
]

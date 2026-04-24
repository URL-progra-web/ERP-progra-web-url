from django.urls import include, path
from rest_framework.routers import DefaultRouter

from orders.order_notification.apis.views import OrderNotificationViewSet

router = DefaultRouter()
router.register(r'', OrderNotificationViewSet, basename='order-notification')

urlpatterns = [
    path('', include(router.urls)),
]

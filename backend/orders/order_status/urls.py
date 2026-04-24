from django.urls import include, path
from rest_framework.routers import DefaultRouter

from orders.order_status.apis.views import (
    OrderStatusViewSet,
    OrderStatsDailyAPIView,
    OrderStatsCumulativeAPIView,
)

router = DefaultRouter()
router.register(r'', OrderStatusViewSet, basename='order-status')

urlpatterns = [
    path('stats/daily/', OrderStatsDailyAPIView.as_view(), name='order-stats-daily'),
    path('stats/cumulative/', OrderStatsCumulativeAPIView.as_view(), name='order-stats-cumulative'),
    path('', include(router.urls)),
]

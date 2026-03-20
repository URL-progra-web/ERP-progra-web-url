from django.urls import include, path
from rest_framework.routers import DefaultRouter

from orders.payment_method.apis.views import PaymentMethodViewSet

router = DefaultRouter()
router.register(r'', PaymentMethodViewSet, basename='payment-method')

urlpatterns = [
    path('', include(router.urls)),
]

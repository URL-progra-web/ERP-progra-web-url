from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.uom_conversion.apis.views import UomConversionViewSet

uom_conversion_router = DefaultRouter()
uom_conversion_router.register(r'', UomConversionViewSet, basename='uom-conversion')

urlpatterns = [
    path('', include(uom_conversion_router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from inventory.uom.apis.views import UomViewSet

uom_router = DefaultRouter()
uom_router.register(r'', UomViewSet, basename='uom')

urlpatterns = [
    path('', include(uom_router.urls)),
]

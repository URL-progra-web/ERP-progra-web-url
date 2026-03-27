from django.urls import include, path
from rest_framework.routers import DefaultRouter

from crm.entrepreneur.apis.views import EntrepreneurViewSet

router = DefaultRouter()
router.register(r'', EntrepreneurViewSet, basename='entrepreneur')

urlpatterns = [
    path('', include(router.urls)),
]

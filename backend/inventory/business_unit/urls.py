from rest_framework.routers import DefaultRouter
from inventory.business_unit.apis.views import BusinessUnitViewSet


router = DefaultRouter()
router.register(r'', BusinessUnitViewSet, basename='business-unit')

urlpatterns = router.urls

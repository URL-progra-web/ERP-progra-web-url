from rest_framework.routers import DefaultRouter
from products.variant.apis.views import ProductVariantViewSet

router = DefaultRouter()
router.register(r'', ProductVariantViewSet, basename='variant')

urlpatterns = router.urls
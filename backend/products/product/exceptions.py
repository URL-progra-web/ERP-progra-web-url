from rest_framework.routers import DefaultRouter
from products.product.apis.views import ProductViewSet

router = DefaultRouter()
router.register(r'', ProductViewSet, basename='product')

urlpatterns = router.urls
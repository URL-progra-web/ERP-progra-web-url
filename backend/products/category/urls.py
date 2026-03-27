from rest_framework.routers import DefaultRouter
from products.category.apis.views import CategoryViewSet

router = DefaultRouter()
router.register(r'', CategoryViewSet, basename='category')

urlpatterns = router.urls
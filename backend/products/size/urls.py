from rest_framework.routers import DefaultRouter
from products.size.apis.views import SizeViewSet

router = DefaultRouter()
router.register(r'', SizeViewSet, basename='size')

urlpatterns = router.urls
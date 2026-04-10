from rest_framework.routers import DefaultRouter
from products.color.apis.views import ColorViewSet

router = DefaultRouter()
router.register(r'', ColorViewSet, basename='color')

urlpatterns = router.urls
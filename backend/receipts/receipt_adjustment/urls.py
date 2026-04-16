from rest_framework.routers import DefaultRouter
from receipts.receipt_adjustment.apis.views import ReceiptAdjustmentViewSet

router = DefaultRouter()
router.register(r'', ReceiptAdjustmentViewSet, basename='receipt-adjustment')

urlpatterns = router.urls
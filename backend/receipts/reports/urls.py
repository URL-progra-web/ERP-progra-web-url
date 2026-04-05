from django.urls import path, include
from rest_framework.routers import DefaultRouter
from receipts.reports.apis.views import BillingReportViewSet

router = DefaultRouter()
router.register(r'', BillingReportViewSet, basename='billing-report')

urlpatterns = [
    path('', include(router.urls)),
]
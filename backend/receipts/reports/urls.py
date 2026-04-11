from django.urls import path
from receipts.reports.apis.views import BillingReportViewSet

urlpatterns = [
    path('summary/', BillingReportViewSet.as_view({'get': 'summary'})),
    path('by-day/', BillingReportViewSet.as_view({'get': 'by_day'})),
    path('by-month/', BillingReportViewSet.as_view({'get': 'by_month'})),
    path('by-customer/', BillingReportViewSet.as_view({'get': 'by_customer'})),
    path('by-user/', BillingReportViewSet.as_view({'get': 'by_user'})),
    path('by-entrepreneur/', BillingReportViewSet.as_view({'get': 'by_entrepreneur'})),
]

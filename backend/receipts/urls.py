from django.urls import path, include

urlpatterns = [
    path('reports/', include('receipts.reports.urls')),
    path('<int:receipt_pk>/adjustments/', include('receipts.receipt_adjustment.urls')),
    path('', include('receipts.receipt.urls')),
]
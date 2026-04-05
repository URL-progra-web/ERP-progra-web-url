from django.urls import path, include

urlpatterns = [
    path('', include('receipts.receipt.urls')),
    path('<int:receipt_pk>/adjustments/', include('receipts.receipt_adjustment.urls')),
    path('reports/', include('receipts.reports.urls')),
]
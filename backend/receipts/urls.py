from django.urls import path, include

urlpatterns = [
    path('', include('receipts.receipt.urls')),
]
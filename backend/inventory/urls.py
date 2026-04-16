from django.urls import path, include

urlpatterns = [
    path('uoms/', include('inventory.uom.urls')),
    path('uom-conversions/', include('inventory.uom_conversion.urls')),
    path('transaction-types/', include('inventory.transaction_type.urls')),
    path('transactions/', include('inventory.transaction.urls')),
    path('business-units/', include('inventory.business_unit.urls')),
]

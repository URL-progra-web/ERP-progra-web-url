from django.urls import path, include

urlpatterns = [
    path('uoms/', include('inventory.uom.urls')),
    path('uom-conversions/', include('inventory.uom_conversion.urls')),
]

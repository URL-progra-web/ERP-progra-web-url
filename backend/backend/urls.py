from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/products/', include('products.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/orders/', include('orders.urls')),


    path('api/receipts/', include('receipts.urls')),
]

from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/crm/', include('crm.urls')),
    path('api/products/', include('products.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/receipts/', include('receipts.urls')),
]

if settings.ENABLE_PUBLIC_STOREFRONT:
    urlpatterns.append(path('api/public/', include('public.urls')))

if settings.ENABLE_API_DOCS:
    urlpatterns = [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('redocs/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ] + urlpatterns

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

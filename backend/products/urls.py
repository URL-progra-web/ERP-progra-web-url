from django.urls import path, include

urlpatterns = [
    path('categories/', include('products.category.urls')),
    path('colors/', include('products.color.urls')),
    path('sizes/', include('products.size.urls')),
    path('products/', include('products.product.urls')),
    path('variants/', include('products.variant.urls')),
]
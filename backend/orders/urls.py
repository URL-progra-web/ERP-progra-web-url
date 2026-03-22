from django.urls import include, path

urlpatterns = [
    path('payment-methods/', include('orders.payment_method.urls')),
    path('statuses/', include('orders.order_status.urls')),
    path('', include('orders.order.urls')),
]

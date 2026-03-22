from django.urls import path

from orders.order.apis.views import OrderAPIView, OrderCatalogAPIView

urlpatterns = [
    path('', OrderAPIView.as_view(), name='orders-list-create'),
    path('catalogs/', OrderCatalogAPIView.as_view(), name='orders-catalogs'),
]

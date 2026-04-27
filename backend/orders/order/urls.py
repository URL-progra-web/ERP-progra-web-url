from django.urls import path

from orders.order.apis.views import (
    OrderAPIView,
    OrderCatalogAPIView,
    OrderDetailAPIView,
    OrderExportExcelAPIView,
)

urlpatterns = [
    path('', OrderAPIView.as_view(), name='orders-list-create'),
    path('<int:pk>/', OrderDetailAPIView.as_view(), name='orders-detail'),
    path('catalogs/', OrderCatalogAPIView.as_view(), name='orders-catalogs'),
    path('export/excel/', OrderExportExcelAPIView.as_view(), name='orders-export-excel'),
]

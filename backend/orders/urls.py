from django.urls import include, path

from orders.order.apis.views import OrderAPIView, OrderCatalogAPIView, OrderDetailAPIView, OrderExportExcelAPIView
from orders.order_history.apis.views import OrderHistoryAPIView

urlpatterns = [
    path('payment-methods/', include('orders.payment_method.urls')),
    path('statuses/', include('orders.order_status.urls')),
    path('items/', include('orders.order_item.urls')),
    path('notifications/', include('orders.order_notification.urls')),
    path('export/excel/', OrderExportExcelAPIView.as_view(), name='orders-export-excel'),
    path('', OrderAPIView.as_view(), name='orders-list-create'),
    path('<int:pk>/', OrderDetailAPIView.as_view(), name='orders-detail'),
    path('catalogs/', OrderCatalogAPIView.as_view(), name='orders-catalogs'),
    path('<int:pk>/history/', OrderHistoryAPIView.as_view(), name='orders-history'),
]

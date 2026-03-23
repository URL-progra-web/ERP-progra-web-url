from django.urls import path

from orders.order_item.apis.views import (
	OrderItemAPIView,
	OrderItemBulkCreateAPIView,
	OrderItemDetailAPIView,
)

urlpatterns = [
	path('', OrderItemAPIView.as_view(), name='order-items-list-create'),
	path('bulk/', OrderItemBulkCreateAPIView.as_view(), name='order-items-bulk-create'),
	path('<int:pk>/', OrderItemDetailAPIView.as_view(), name='order-items-detail'),
]

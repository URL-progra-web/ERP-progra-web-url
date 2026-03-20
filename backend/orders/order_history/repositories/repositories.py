from typing import Optional

from django.db.models import QuerySet

from orders.order.models.models import Order
from orders.order_status.models.models import OrderStatus
from orders.order_history.models.models import OrderStatusHistory
from users.user.models.models import User


class OrderStatusHistoryRepository:
    def list_for_order(self, order: Order) -> QuerySet:
        return OrderStatusHistory.objects.filter(order=order).select_related('status', 'user').order_by('-created_at')

    def create(self, order: Order, status: OrderStatus, user: Optional[User] = None, notes: Optional[str] = None) -> OrderStatusHistory:
        return OrderStatusHistory.objects.create(order=order, status=status, user=user, notes=notes)

from typing import Optional

from django.db.models import QuerySet

from orders.order.models.models import Order
from orders.order_status.models.models import OrderStatus


class OrderRepository:
    def list(self) -> QuerySet:
        return Order.objects.select_related('customer', 'payment_method', 'status').all()

    def get_by_id(self, order_id: int) -> Optional[Order]:
        return (
            Order.objects.select_related('customer', 'payment_method', 'status')
            .filter(id=order_id)
            .first()
        )

    def exists_with_status(self, status: OrderStatus) -> bool:
        return Order.objects.filter(status=status).exists()

    def save(self, order: Order) -> Order:
        order.save()
        return order

    def update_status(self, order: Order, status: OrderStatus) -> Order:
        order.status = status
        order.save(update_fields=['status', 'updated_at'])
        return order

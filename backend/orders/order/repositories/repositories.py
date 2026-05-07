from typing import Optional

from django.db.models import QuerySet, Q

from orders.order.models.models import Order
from orders.order_status.models.models import OrderStatus


class OrderRepository:
    def list(self, search=None) -> QuerySet:
        queryset = Order.objects.select_related(
            'customer',
            'payment_method',
            'status'
        )

        if search:
            queryset = queryset.filter(
                Q(short_id__icontains=search) |
                Q(customer__name__icontains=search) |
                Q(status__name__iexact=search)
            )

        return queryset.order_by('-created_at')

    def list_for_export(self, date_from=None, date_to=None) -> QuerySet:
        qs = (
            Order.objects
            .select_related('customer', 'payment_method', 'status')
            .prefetch_related('items')
            .order_by('created_at')
        )
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs

    def get_by_id(self, order_id: int) -> Optional[Order]:
        return (
            Order.objects.select_related('customer', 'payment_method', 'status')
            .filter(id=order_id)
            .first()
        )

    def exists_by_short_id(self, short_id: str) -> bool:
        return Order.objects.filter(short_id=short_id).exists()

    def get_last_short_id_by_prefix(self, prefix: str) -> Optional[str]:
        return (
            Order.objects.filter(short_id__startswith=prefix)
            .order_by('-short_id')
            .values_list('short_id', flat=True)
            .first()
        )

    def create(self, **kwargs) -> Order:
        return Order.objects.create(**kwargs)

    def exists_with_status(self, status: OrderStatus) -> bool:
        return Order.objects.filter(status=status).exists()

    def save(self, order: Order) -> Order:
        order.save()
        return order

    def update(self, order: Order, **kwargs) -> Order:
        for field, value in kwargs.items():
            setattr(order, field, value)
        order.save()
        return order

    def update_status(self, order: Order, status: OrderStatus) -> Order:
        order.status = status
        order.save(update_fields=['status', 'updated_at'])
        return order

    def delete(self, order: Order) -> None:
        order.delete()

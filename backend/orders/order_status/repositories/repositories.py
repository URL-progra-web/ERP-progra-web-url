from typing import Optional

from django.db.models import QuerySet

from orders.order_status.models.models import OrderStatus


class OrderStatusRepository:
    def list(self, search: Optional[str] = None) -> QuerySet:
        qs = OrderStatus.objects.all()
        if search:
            qs = qs.filter(name__icontains=search)
        return qs.order_by('id')

    def get_by_id(self, status_id: int) -> Optional[OrderStatus]:
        return OrderStatus.objects.filter(id=status_id).first()

    def get_by_name(self, name: str) -> Optional[OrderStatus]:
        return OrderStatus.objects.filter(name__iexact=name).first()

    def create(self, name: str, description: Optional[str] = None) -> OrderStatus:
        return OrderStatus.objects.create(name=name, description=description)

    def update(self, status: OrderStatus, **fields) -> OrderStatus:
        for attr, value in fields.items():
            setattr(status, attr, value)
        status.save()
        return status

    def delete(self, status: OrderStatus) -> None:
        status.delete()

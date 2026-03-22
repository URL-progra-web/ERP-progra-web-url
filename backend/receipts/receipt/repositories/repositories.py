from typing import Optional
from django.db.models import QuerySet
from orders.receipt.models.models import Receipt


class ReceiptRepository:
    def list(self) -> QuerySet:
        return Receipt.objects.select_related('order', 'issued_by').all()

    def get_by_id(self, receipt_id: int) -> Optional[Receipt]:
        return Receipt.objects.select_related('order', 'issued_by').filter(id=receipt_id).first()

    def get_by_order(self, order_id: int) -> Optional[Receipt]:
        return Receipt.objects.select_related('order', 'issued_by').filter(order__id=order_id).first()
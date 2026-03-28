from typing import Optional
from django.db.models import QuerySet
from receipts.receipt.models.models import Receipt


class ReceiptRepository:
    def _base_queryset(self) -> QuerySet:
        return Receipt.objects.select_related(
            'order__customer',
            'order__payment_method',
            'order__status',
            'issued_by',
        ).prefetch_related(
            'order__items__variant',
            'order__items__selected_uom',
            'order__items__base_uom',
        )

    def list(self) -> QuerySet:
        return self._base_queryset().all()

    def get_by_id(self, receipt_id: int) -> Optional[Receipt]:
        return self._base_queryset().filter(id=receipt_id).first()

    def get_by_order(self, order_id: int) -> Optional[Receipt]:
        return self._base_queryset().filter(order__id=order_id).first()

    def save(self, receipt: Receipt) -> Receipt:
        receipt.save()
        return receipt
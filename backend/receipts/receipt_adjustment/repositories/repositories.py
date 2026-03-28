from typing import Optional
from django.db.models import QuerySet
from receipts.receipt_adjustment.models.models import ReceiptAdjustment


class ReceiptAdjustmentRepository:
    def list_by_receipt(self, receipt_id: int) -> QuerySet:
        return ReceiptAdjustment.objects.filter(receipt__id=receipt_id).all()

    def get_by_id(self, adjustment_id: int) -> Optional[ReceiptAdjustment]:
        return (
            ReceiptAdjustment.objects.filter(id=adjustment_id).first()
        )

    def save(self, adjustment: ReceiptAdjustment) -> ReceiptAdjustment:
        adjustment.save()
        return adjustment
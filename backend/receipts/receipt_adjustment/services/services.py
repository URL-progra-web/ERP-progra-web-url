from typing import Optional
from django.db.models import QuerySet
from orders.receipt_adjustment.models.models import ReceiptAdjustment
from orders.receipt_adjustment.repositories.repositories import ReceiptAdjustmentRepository


class ReceiptAdjustmentService:
    def __init__(self):
        self.repository = ReceiptAdjustmentRepository()

    def list_by_receipt(self, receipt_id: int) -> QuerySet:
        return self.repository.list_by_receipt(receipt_id)

    def get_by_id(self, adjustment_id: int) -> Optional[ReceiptAdjustment]:
        return self.repository.get_by_id(adjustment_id)

    def save(self, adjustment: ReceiptAdjustment) -> ReceiptAdjustment:
        return self.repository.save(adjustment)
from typing import Optional
from django.db.models import QuerySet
from receipts.receipt_adjustment.models.models import ReceiptAdjustment
from receipts.receipt_adjustment.repositories.repositories import ReceiptAdjustmentRepository
from receipts.receipt.repositories.repositories import ReceiptRepository


class ReceiptAdjustmentService:
    def __init__(self):
        self.repository = ReceiptAdjustmentRepository()
        self.receipt_repository = ReceiptRepository()

    def list_by_receipt(self, receipt_id: int) -> QuerySet:
        return self.repository.list_by_receipt(receipt_id)

    def get_by_id(self, adjustment_id: int) -> Optional[ReceiptAdjustment]:
        return self.repository.get_by_id(adjustment_id)

    def create(self, receipt_id: int, adjustment_type: str, reason: str, amount: float) -> ReceiptAdjustment:
        receipt = self.receipt_repository.get_by_id(receipt_id)
        if not receipt:
            raise ValueError(f'Recibo {receipt_id} no encontrado.')

        if adjustment_type not in ['DISCOUNT', 'SURCHARGE']:
            raise ValueError("adjustment_type debe ser 'DISCOUNT' o 'SURCHARGE'.")

        adjustment = ReceiptAdjustment(
            receipt=receipt,
            adjustment_type=adjustment_type,
            reason=reason,
            amount=amount,
        )
        return self.repository.save(adjustment)
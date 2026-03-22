from typing import Optional
from django.db.models import QuerySet
from orders.receipt.models.models import Receipt
from orders.receipt.repositories.repositories import ReceiptRepository


class ReceiptService:
    def __init__(self):
        self.repository = ReceiptRepository()

    def list(self) -> QuerySet:
        return self.repository.list()

    def get_by_id(self, receipt_id: int) -> Optional[Receipt]:
        return self.repository.get_by_id(receipt_id)

    def create_from_order(self, order_id: int) -> None:
        #implementar cuando módulo de órdenes esté disponible
        pass

    def save(self, receipt: Receipt) -> Receipt:
        return self.repository.save(receipt)
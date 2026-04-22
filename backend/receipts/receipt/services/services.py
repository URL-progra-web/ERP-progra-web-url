from typing import Optional
from django.db.models import QuerySet
from django.utils import timezone
from receipts.receipt.models.models import Receipt
from orders.order.models.models import Order
from receipts.receipt.repositories.repositories import ReceiptRepository


class ReceiptService:
    def __init__(self):
        self.repository = ReceiptRepository()

    def list(self) -> QuerySet:
        return self.repository.list()

    def get_by_id(self, receipt_id: int) -> Optional[Receipt]:
        return self.repository.get_by_id(receipt_id)

    def get_by_order(self, order_id: int) -> Optional[Receipt]:
        return self.repository.get_by_order(order_id)

    def create_from_order(self, order_id: int, issued_by) -> Receipt:
        order = Order.objects.select_related(
            'customer', 'payment_method', 'status'
        ).prefetch_related(
            'items__variant', 'items__selected_uom'
        ).filter(id=order_id).first()

        if not order:
            raise ValueError(f'Orden {order_id} no encontrada.')

        if self.repository.get_by_order(order_id):
            raise ValueError(f'Ya existe un recibo para la orden {order_id}.')

        subtotal = sum(item.quantity * item.unit_price for item in order.items.all())
        shipping_total = order.shipping_cost
        grand_total = subtotal + shipping_total

        receipt = Receipt(
            order=order,
            issued_by=issued_by,
            receipt_number=self._generate_receipt_number(),
            subtotal=subtotal,
            shipping_total=shipping_total,
            discount_total=0,
            grand_total=grand_total,
        )
        return self.repository.save(receipt)

    def _generate_receipt_number(self) -> str:
        year = timezone.now().year
        prefix = f'REC-{year}-'
        last = Receipt.objects.filter(
            receipt_number__startswith=prefix
        ).order_by('-receipt_number').first()
        seq = 1
        if last:
            try:
                seq = int(last.receipt_number.split('-')[-1]) + 1
            except ValueError:
                pass
        return f'{prefix}{seq:04d}'
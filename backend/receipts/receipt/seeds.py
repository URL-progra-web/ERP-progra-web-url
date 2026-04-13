from core.seeds import BaseSeeder
from orders.order.models.models import Order
from receipts.receipt.models.models import Receipt
from receipts.receipt.services.services import ReceiptService
from users.user.models.models import User


class ReceiptSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()
        self.receipt_service = ReceiptService()

    def run(self):
        candidate_orders = Order.objects.select_related('status').order_by('id')
        if not candidate_orders.exists():
            print('No orders found. Skipping receipt seeder.')
            return

        issued_by = User.objects.order_by('id').first()
        created_count = 0

        for order in candidate_orders:
            if Receipt.objects.filter(order=order).exists():
                continue

            status_name = (order.status.name if order.status else '').upper()
            if status_name != 'ENTREGADO':
                continue

            try:
                receipt = self.receipt_service.create_from_order(order.id, issued_by)
                created_count += 1
                print(f'Created receipt {receipt.receipt_number} for order {order.short_id}')
            except Exception as exc:
                print(f'Could not create receipt for order {order.id}: {exc}')

        if created_count == 0:
            print('No new receipts were created (already seeded or no eligible orders).')

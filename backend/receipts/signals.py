from django.db.models.signals import post_save
from django.dispatch import receiver

from orders.order_history.models.models import OrderStatusHistory


@receiver(post_save, sender=OrderStatusHistory)
def generate_receipt_on_confirmation(sender, instance: OrderStatusHistory, created: bool, **kwargs):
    if not created:
        return
    if instance.status.name != 'CONFIRMADO':
        return

    from receipts.receipt.services.services import ReceiptService
    service = ReceiptService()

    if service.get_by_order(instance.order_id):
        return

    service.create_from_order(order_id=instance.order_id, issued_by=instance.user)

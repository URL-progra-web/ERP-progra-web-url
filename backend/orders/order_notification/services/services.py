from datetime import timedelta

from django.utils import timezone

from orders.order_notification.models.models import OrderNotification


class OrderNotificationService:
    RETENTION_DAYS = 60

    @classmethod
    def create_new_public_order_notification(cls, order):
        cls.purge_expired_notifications()
        return OrderNotification.objects.create(
            order=order,
            title='Nuevo pedido en tienda online',
            message=f'Alguien ha pedido algo, su orden es {order.short_id}.',
        )

    @classmethod
    def purge_expired_notifications(cls) -> int:
        threshold = timezone.now() - timedelta(days=cls.RETENTION_DAYS)
        deleted, _ = OrderNotification.objects.filter(created_at__lt=threshold).delete()
        return deleted

    @classmethod
    def list_notifications(cls):
        cls.purge_expired_notifications()
        return OrderNotification.objects.select_related('order', 'order__customer', 'order__status').filter(
            order__status__name__iexact='BORRADOR'
        )

from django.core.management.base import BaseCommand

from orders.order_notification.services.services import OrderNotificationService


class Command(BaseCommand):
    help = 'Delete order notifications older than the retention window'

    def handle(self, *args, **options):
        deleted_count = OrderNotificationService.purge_expired_notifications()
        self.stdout.write(
            self.style.SUCCESS(f'Se eliminaron {deleted_count} notificacion(es) vencida(s).')
        )

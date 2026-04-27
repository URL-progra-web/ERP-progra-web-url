from django.db import models

from orders.order.models.models import Order


class OrderNotification(models.Model):
    order = models.ForeignKey(Order, on_delete=models.RESTRICT, related_name='notifications')
    title = models.CharField(max_length=120)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} ({self.order.short_id})'

from django.db import models
from orders.order.models.models import Order
from users.user.models.models import User
from orders.order_status.models.models import OrderStatus

class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.RESTRICT, null=True, blank=True)
    status = models.ForeignKey(OrderStatus, on_delete=models.RESTRICT)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_status_history'

    def __str__(self):
        return f"{self.order.short_id} -> {self.status.name}"

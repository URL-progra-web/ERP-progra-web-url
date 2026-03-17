from django.db import models
from orders.order_item.models.models import OrderItem
from users.user.models.models import User
from orders.order_status.models.models import OrderStatus

class OrderItemStatusHistory(models.Model):
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='history')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.ForeignKey(OrderStatus, on_delete=models.RESTRICT)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_item_status_history'

    def __str__(self):
        return f"Item {self.order_item.id} -> {self.status.name}"

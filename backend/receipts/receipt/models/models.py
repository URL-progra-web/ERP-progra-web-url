from django.db import models
from users.user.models.models import User
from orders.order.models.models import Order


class Receipt(models.Model):
    receipt_number = models.CharField(max_length=50, unique=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    discount_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)
    issued_by = models.ForeignKey(User, on_delete=models.RESTRICT, null=True, blank=True)
    order = models.ForeignKey(Order, on_delete=models.RESTRICT)

    class Meta:
        app_label = 'orders'
        db_table = 'receipts'

    def __str__(self):
        return self.receipt_number

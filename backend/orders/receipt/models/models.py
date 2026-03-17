from django.db import models
from orders.order.models.models import Order
from users.user.models.models import User

class Receipt(models.Model):
    order = models.ForeignKey(Order, on_delete=models.RESTRICT)
    receipt_number = models.CharField(max_length=50, unique=True)
    issued_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_total = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(null=True, blank=True)
    issued_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'receipts'

    def __str__(self):
        return self.receipt_number

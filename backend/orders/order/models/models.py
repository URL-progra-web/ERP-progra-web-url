from django.db import models
from crm.customer.models.models import Customer
from orders.payment_method.models.models import PaymentMethod
from orders.order_status.models.models import OrderStatus

class Order(models.Model):
    short_id = models.CharField(max_length=20, unique=True)
    customer = models.ForeignKey(Customer, on_delete=models.RESTRICT)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.ForeignKey(OrderStatus, on_delete=models.RESTRICT)
    shipping_address = models.TextField(null=True, blank=True)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'orders'

    def __str__(self):
        return self.short_id

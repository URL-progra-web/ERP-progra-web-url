from django.db import models
from inventory.uom.models.models import UoM
from orders.order.models.models import Order
from products.variant.models.models import ProductVariant
from orders.order_status.models.models import OrderStatus

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.RESTRICT)
    selected_uom = models.ForeignKey(UoM, on_delete=models.RESTRICT, related_name='order_items_selected')
    base_uom = models.ForeignKey(UoM, on_delete=models.RESTRICT, related_name='order_items_base')
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    conversion_multiplier = models.DecimalField(max_digits=14, decimal_places=4)
    base_quantity = models.DecimalField(max_digits=14, decimal_places=4)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.ForeignKey(OrderStatus, on_delete=models.RESTRICT)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'order_items'

    def __str__(self):
        return f"{self.quantity} x {self.variant.sku} (Order: {self.order.short_id})"

from django.db import models
from inventory.uom.models.models import UoM
from products.variant.models.models import ProductVariant
from users.user.models.models import User
from inventory.transaction_type.models.models import TransactionType

class InventoryTransaction(models.Model):
    variant = models.ForeignKey(ProductVariant, on_delete=models.RESTRICT)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    transaction_type = models.ForeignKey(TransactionType, on_delete=models.RESTRICT)
    selected_uom = models.ForeignKey(UoM, on_delete=models.RESTRICT, related_name='inventory_transactions_selected')
    base_uom = models.ForeignKey(UoM, on_delete=models.RESTRICT, related_name='inventory_transactions_base')
    quantity = models.DecimalField(max_digits=14, decimal_places=4)
    conversion_multiplier = models.DecimalField(max_digits=14, decimal_places=4)
    base_quantity = models.DecimalField(max_digits=14, decimal_places=4)
    reference = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory_transactions'

    def __str__(self):
        return f"{self.transaction_type.name} - {self.quantity} ({self.variant.sku})"

from django.db import models
from receipts.receipt.models.models import Receipt


class ReceiptAdjustment(models.Model):
    adjustment_type = models.CharField(max_length=50)
    reason = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    receipt = models.ForeignKey(Receipt, on_delete=models.CASCADE, related_name='adjustments')

    class Meta:
        app_label = 'orders'
        db_table = 'receipt_adjustments'

    def __str__(self):
        return f'{self.adjustment_type} - {self.receipt.receipt_number}'

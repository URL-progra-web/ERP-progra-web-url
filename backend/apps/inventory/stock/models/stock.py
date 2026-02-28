from django.db import models

from apps.inventory.product.models import Product
from apps.inventory.warehouse.models import Warehouse


class Stock(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="stocks",
    )
    warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.CASCADE,
        related_name="stocks",
    )
    quantity = models.IntegerField("cantidad", default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"inventory"."stock"'
        verbose_name = "stock"
        verbose_name_plural = "stocks"
        ordering = ["warehouse", "product"]
        constraints = [
            models.UniqueConstraint(
                fields=["product", "warehouse"],
                name="unique_product_warehouse",
            )
        ]

    def __str__(self):
        return f"{self.product} @ {self.warehouse}: {self.quantity}"

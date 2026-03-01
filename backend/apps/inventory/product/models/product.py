from decimal import Decimal

from django.db import models

from apps.inventory.category.models import Category


class Product(models.Model):
    name = models.CharField("nombre", max_length=200)
    code = models.CharField("código", max_length=50, unique=True)
    description = models.TextField("descripción", blank=True)
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="products",
    )
    unit = models.CharField("unidad", max_length=20, default="unidad")
    sale_price = models.DecimalField(
        "precio venta",
        max_digits=12,
        decimal_places=2,
        default=Decimal("0"),
    )
    cost_price = models.DecimalField(
        "precio costo",
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )
    is_active = models.BooleanField("activo", default=True)
    stock_minimo = models.PositiveIntegerField("stock mínimo", default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = '"inventory"."product"'
        verbose_name = "producto"
        verbose_name_plural = "productos"
        ordering = ["name"]

    def __str__(self):
        return self.name

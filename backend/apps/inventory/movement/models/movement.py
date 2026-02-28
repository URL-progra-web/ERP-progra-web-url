from django.conf import settings
from django.db import models

from apps.inventory.product.models import Product
from apps.inventory.warehouse.models import Warehouse


class MovementType(models.Model):
    class Direction(models.TextChoices):
        IN = "IN", "Entrada"
        OUT = "OUT", "Salida"

    name = models.CharField("nombre", max_length=50)
    direction = models.CharField(
        "dirección",
        max_length=3,
        choices=Direction.choices,
    )
    code = models.CharField("código", max_length=20, unique=True, blank=True)

    class Meta:
        db_table = '"inventory"."movement_type"'
        verbose_name = "tipo de movimiento"
        verbose_name_plural = "tipos de movimiento"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Movement(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        related_name="movements",
    )
    from_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name="movements_out",
        null=True,
        blank=True,
        verbose_name="almacén origen",
    )
    to_warehouse = models.ForeignKey(
        Warehouse,
        on_delete=models.PROTECT,
        related_name="movements_in",
        null=True,
        blank=True,
        verbose_name="almacén destino",
    )
    movement_type = models.ForeignKey(
        MovementType,
        on_delete=models.PROTECT,
        related_name="movements",
    )
    quantity = models.PositiveIntegerField("cantidad")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="inventory_movements",
    )
    reference = models.CharField("referencia", max_length=100, blank=True)
    notes = models.TextField("notas", blank=True)

    class Meta:
        db_table = '"inventory"."movement"'
        verbose_name = "movimiento"
        verbose_name_plural = "movimientos"
        ordering = ["-created_at"]

    def __str__(self):
        orig = getattr(self.from_warehouse, "code", None) or "—"
        dest = getattr(self.to_warehouse, "code", None) or "—"
        return f"{self.movement_type} {self.quantity} {self.product} ({orig} → {dest})"

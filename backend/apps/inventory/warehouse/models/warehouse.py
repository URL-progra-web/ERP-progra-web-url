from django.db import models


class Warehouse(models.Model):
    name = models.CharField("nombre", max_length=100)
    code = models.CharField("código", max_length=20, unique=True)
    address = models.CharField("dirección", max_length=255, blank=True)
    is_active = models.BooleanField("activo", default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"inventory"."warehouse"'
        verbose_name = "almacén"
        verbose_name_plural = "almacenes"
        ordering = ["name"]

    def __str__(self):
        return self.name

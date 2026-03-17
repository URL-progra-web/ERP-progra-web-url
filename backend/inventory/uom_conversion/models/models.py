from django.db import models
from inventory.uom.models.models import UoM

class UoMConversion(models.Model):
    from_uom = models.ForeignKey(UoM, related_name='conversions_from', on_delete=models.RESTRICT)
    to_uom = models.ForeignKey(UoM, related_name='conversions_to', on_delete=models.RESTRICT)
    multiplier = models.DecimalField(max_digits=10, decimal_places=4)

    class Meta:
        db_table = 'uom_conversions'
        unique_together = ('from_uom', 'to_uom')

    def __str__(self):
        return f"1 {self.from_uom.code} = {self.multiplier} {self.to_uom.code}"

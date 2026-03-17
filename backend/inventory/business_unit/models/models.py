from django.db import models

class BusinessUnit(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'business_units'

    def __str__(self):
        return self.name

from django.db import models
from crm.entrepreneur.models.models import Entrepreneur
from inventory.business_unit.models.models import BusinessUnit
from products.category.models.models import Category

class Product(models.Model):
    entrepreneur = models.ForeignKey(Entrepreneur, on_delete=models.RESTRICT)
    business_unit = models.ForeignKey(BusinessUnit, on_delete=models.RESTRICT)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'

    def __str__(self):
        return self.name

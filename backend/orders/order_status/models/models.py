from django.db import models

class OrderStatus(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'order_statuses'

    def __str__(self):
        return self.name

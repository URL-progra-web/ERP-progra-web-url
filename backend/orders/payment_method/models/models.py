from django.db import models

class PaymentMethod(models.Model):
    name = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    is_protected = models.BooleanField(default=False)

    class Meta:
        db_table = 'payment_methods'

    def __str__(self):
        return self.name

from django.db import models

class Customer(models.Model):
    TYPE_CHOICES = (
        ('RETAIL', 'Minorista'),
        ('WHOLESALE', 'Mayorista'),
    )
    
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=50, unique=True)
    email = models.EmailField(max_length=255, null=True, blank=True, unique=True)
    address = models.TextField(null=True, blank=True)
    customer_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='RETAIL')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'customers'

    def __str__(self):
        return self.name

from django.db import models

class TransactionType(models.Model):
    name = models.CharField(max_length=50, primary_key=True)
    factor = models.SmallIntegerField()
    description = models.TextField(null=True, blank=True)

    class Meta:
        db_table = 'transaction_types'

    def __str__(self):
        return self.name

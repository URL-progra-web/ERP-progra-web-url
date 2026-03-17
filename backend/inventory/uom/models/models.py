from django.db import models

class UoM(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=50)

    class Meta:
        db_table = 'uoms'

    def __str__(self):
        return f"{self.name} ({self.code})"

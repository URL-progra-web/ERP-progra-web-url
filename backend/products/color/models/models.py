from django.db import models

class Color(models.Model):
    name = models.CharField(max_length=50, unique=True)
    hex_code = models.CharField(max_length=10, null=True, blank=True)

    class Meta:
        db_table = 'colors'

    def __str__(self):
        return self.name

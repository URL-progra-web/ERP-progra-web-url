from django.db import models

class Size(models.Model):
    name = models.CharField(max_length=50, unique=True)

    class Meta:
        db_table = 'sizes'

    def __str__(self):
        return self.name

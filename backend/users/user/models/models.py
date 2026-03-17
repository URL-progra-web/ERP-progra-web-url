from django.db import models
from users.role.models.models import Role

class User(models.Model):
    role = models.ForeignKey(Role, on_delete=models.RESTRICT)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
    password_hash = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.name

    @property
    def is_authenticated(self):
        return True

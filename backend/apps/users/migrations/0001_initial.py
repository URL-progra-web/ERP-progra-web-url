# Generated manually for custom User model (AbstractUser + email as USERNAME_FIELD)

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True
    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="User",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("password", models.CharField(max_length=128, verbose_name="password")),
                ("last_login", models.DateTimeField(blank=True, null=True, verbose_name="last login")),
                ("is_superuser", models.BooleanField(default=False, verbose_name="superuser status")),
                ("username", models.CharField(blank=True, max_length=150, null=True)),
                ("first_name", models.CharField(max_length=150, verbose_name="nombre")),
                ("last_name", models.CharField(max_length=150, verbose_name="apellido")),
                ("email", models.EmailField(max_length=254, unique=True, verbose_name="email")),
                ("is_staff", models.BooleanField(default=False, verbose_name="staff status")),
                ("is_active", models.BooleanField(default=True, verbose_name="active")),
                ("date_joined", models.DateTimeField(default=django.utils.timezone.now, verbose_name="date joined")),
                ("phone", models.CharField(blank=True, max_length=20, verbose_name="teléfono")),
            ],
            options={
                "db_table": "user",
                "verbose_name": "usuario",
                "verbose_name_plural": "usuarios",
            },
        ),
        migrations.AddField(
            model_name="user",
            name="groups",
            field=models.ManyToManyField(blank=True, help_text="The groups this user belongs to.", related_name="user_set", related_query_name="user", to="auth.group", verbose_name="groups"),
        ),
        migrations.AddField(
            model_name="user",
            name="user_permissions",
            field=models.ManyToManyField(blank=True, help_text="Specific permissions for this user.", related_name="user_set", related_query_name="user", to="auth.permission", verbose_name="user permissions"),
        ),
    ]

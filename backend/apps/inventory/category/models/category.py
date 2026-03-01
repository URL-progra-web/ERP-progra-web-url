from django.db import models


class Category(models.Model):
    name = models.CharField("nombre", max_length=100)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField("descripción", blank=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = '"inventory"."category"'
        verbose_name = "categoría"
        verbose_name_plural = "categorías"
        ordering = ["name"]

    def __str__(self):
        return self.name

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_size_created_at'),
    ]

    operations = [
        migrations.AlterField(
            model_name='productvariant',
            name='quantity_available',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='productvariant',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='product_variants/'),
        ),
    ]

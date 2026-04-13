from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_move_uom_to_product'),
    ]

    operations = [
        migrations.AddField(
            model_name='productvariant',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='product_variants/'),
        ),
    ]

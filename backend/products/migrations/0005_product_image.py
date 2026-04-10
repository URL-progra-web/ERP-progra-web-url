from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0004_productvariant_image_and_stock'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='products/'),
        ),
    ]

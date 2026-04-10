from django.db import migrations, models
import django.db.models.deletion


def move_variant_uom_to_product(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    ProductVariant = apps.get_model('products', 'ProductVariant')

    for product in Product.objects.all():
        variant_uom_ids = list(
            ProductVariant.objects.filter(product_id=product.id)
            .exclude(uom_id__isnull=True)
            .values_list('uom_id', flat=True)
            .distinct()
        )

        if len(variant_uom_ids) > 1:
            raise RuntimeError(
                f'El producto {product.id} tiene variantes con distintas UOM. Normaliza los datos antes de migrar.'
            )

        if variant_uom_ids:
            product.base_uom_id = variant_uom_ids[0]
            product.save(update_fields=['base_uom'])


class Migration(migrations.Migration):
    dependencies = [
        ('inventory', '0003_seed_transaction_types'),
        ('products', '0003_size_created_at'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='base_uom',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                to='inventory.uom',
            ),
        ),
        migrations.RunPython(move_variant_uom_to_product, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='product',
            name='base_uom',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT,
                to='inventory.uom',
            ),
        ),
        migrations.RemoveField(
            model_name='productvariant',
            name='uom',
        ),
        migrations.RemoveField(
            model_name='productvariant',
            name='quantity_available',
        ),
    ]

from django.db import migrations, models
import django.db.models.deletion


def populate_order_item_uoms(apps, schema_editor):
    OrderItem = apps.get_model('orders', 'OrderItem')

    for item in OrderItem.objects.select_related('variant__product__base_uom').all():
        base_uom_id = item.variant.product.base_uom_id
        item.selected_uom_id = base_uom_id
        item.base_uom_id = base_uom_id
        item.conversion_multiplier = 1
        item.base_quantity = item.quantity
        item.save(update_fields=['selected_uom', 'base_uom', 'conversion_multiplier', 'base_quantity'])


class Migration(migrations.Migration):
    dependencies = [
        ('products', '0002_move_uom_to_product'),
        ('orders', '0007_protect_default_payment_methods'),
    ]

    operations = [
        migrations.AddField(
            model_name='orderitem',
            name='selected_uom',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='order_items_selected',
                to='inventory.uom',
            ),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='base_uom',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='order_items_base',
                to='inventory.uom',
            ),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='conversion_multiplier',
            field=models.DecimalField(decimal_places=4, default=1, max_digits=14),
        ),
        migrations.AddField(
            model_name='orderitem',
            name='base_quantity',
            field=models.DecimalField(decimal_places=4, default=0, max_digits=14),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='quantity',
            field=models.DecimalField(decimal_places=4, max_digits=14),
        ),
        migrations.RunPython(populate_order_item_uoms, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='orderitem',
            name='selected_uom',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='order_items_selected',
                to='inventory.uom',
            ),
        ),
        migrations.AlterField(
            model_name='orderitem',
            name='base_uom',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='order_items_base',
                to='inventory.uom',
            ),
        ),
    ]

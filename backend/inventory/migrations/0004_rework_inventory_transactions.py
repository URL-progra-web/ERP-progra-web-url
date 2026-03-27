from django.db import migrations, models
import django.db.models.deletion


def populate_inventory_transaction_uoms(apps, schema_editor):
    InventoryTransaction = apps.get_model('inventory', 'InventoryTransaction')

    for transaction in InventoryTransaction.objects.select_related('variant__product__base_uom').all():
        base_uom_id = transaction.variant.product.base_uom_id
        transaction.selected_uom_id = base_uom_id
        transaction.base_uom_id = base_uom_id
        transaction.conversion_multiplier = 1
        transaction.base_quantity = transaction.quantity
        transaction.save(
            update_fields=['selected_uom', 'base_uom', 'conversion_multiplier', 'base_quantity']
        )


class Migration(migrations.Migration):
    dependencies = [
        ('products', '0002_move_uom_to_product'),
        ('inventory', '0003_seed_transaction_types'),
    ]

    operations = [
        migrations.AddField(
            model_name='inventorytransaction',
            name='selected_uom',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='inventory_transactions_selected',
                to='inventory.uom',
            ),
        ),
        migrations.AddField(
            model_name='inventorytransaction',
            name='base_uom',
            field=models.ForeignKey(
                null=True,
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='inventory_transactions_base',
                to='inventory.uom',
            ),
        ),
        migrations.AddField(
            model_name='inventorytransaction',
            name='conversion_multiplier',
            field=models.DecimalField(decimal_places=4, default=1, max_digits=14),
        ),
        migrations.AddField(
            model_name='inventorytransaction',
            name='base_quantity',
            field=models.DecimalField(decimal_places=4, default=0, max_digits=14),
        ),
        migrations.AlterField(
            model_name='inventorytransaction',
            name='quantity',
            field=models.DecimalField(decimal_places=4, max_digits=14),
        ),
        migrations.RunPython(populate_inventory_transaction_uoms, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='inventorytransaction',
            name='selected_uom',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='inventory_transactions_selected',
                to='inventory.uom',
            ),
        ),
        migrations.AlterField(
            model_name='inventorytransaction',
            name='base_uom',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT,
                related_name='inventory_transactions_base',
                to='inventory.uom',
            ),
        ),
    ]

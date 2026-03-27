from django.db import migrations


def seed_transaction_types(apps, schema_editor):
    TransactionType = apps.get_model('inventory', 'TransactionType')
    TransactionType.objects.update_or_create(
        name='Entrada',
        defaults={
            'factor': 1,
            'description': 'Entrada de inventario',
        },
    )
    TransactionType.objects.update_or_create(
        name='Salida',
        defaults={
            'factor': -1,
            'description': 'Salida de inventario',
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ('inventory', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(seed_transaction_types, migrations.RunPython.noop),
    ]

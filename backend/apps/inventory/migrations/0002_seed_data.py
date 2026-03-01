from django.db import migrations


def create_initial_data(apps, schema_editor):
    MovementType = apps.get_model('inventory', 'MovementType')
    MovementType.objects.bulk_create([
        MovementType(name='Compra', code='COMPRA', direction='IN'),
        MovementType(name='Venta', code='VENTA', direction='OUT'),
        MovementType(name='Merma', code='MERMA', direction='OUT'),
    ])

    MovementStatus = apps.get_model('inventory', 'MovementStatus')
    MovementStatus.objects.bulk_create([
        MovementStatus(name='SOLICITADO', description='Movimiento solicitado pero no iniciado'),
        MovementStatus(name='ENVIADO', description='Movimiento en proceso de entrega'),
        MovementStatus(name='ENTREGADO', description='Movimiento completado'),
    ])


def reverse_initial_data(apps, schema_editor):
    MovementType = apps.get_model('inventory', 'MovementType')
    MovementType.objects.filter(code__in=['COMPRA', 'VENTA', 'MERMA']).delete()

    MovementStatus = apps.get_model('inventory', 'MovementStatus')
    MovementStatus.objects.filter(name__in=['SOLICITADO', 'ENVIADO', 'ENTREGADO']).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('inventory', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_initial_data, reverse_initial_data),
    ]

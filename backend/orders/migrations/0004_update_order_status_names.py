from django.db import migrations


STATUS_MAP = {
    'REQUESTED': 'SOLICITADO',
    'CONFIRMED': 'CONFIRMADO',
    'SHIPPED': 'ENVIADO',
    'DELIVERED': 'ENTREGADO',
    'CANCELLED': 'CANCELADO',
}


def forward(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    for english, spanish in STATUS_MAP.items():
        OrderStatus.objects.filter(name=english).update(name=spanish)


def backward(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    for english, spanish in STATUS_MAP.items():
        OrderStatus.objects.filter(name=spanish).update(name=english)


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0003_seed_payment_methods'),
    ]

    operations = [
        migrations.RunPython(forward, backward),
    ]

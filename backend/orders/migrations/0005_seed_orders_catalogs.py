from django.db import migrations


PAYMENT_METHODS = (
    ('EFECTIVO', True),
    ('TRANSFERENCIA', True),
    ('PAGO CONTRA ENTREGA', True),
)

ORDER_STATUSES = (
    ('SOLICITADO', 'La orden fue creada y espera confirmación.'),
    ('CONFIRMADO', 'La orden fue confirmada y está lista para procesarse.'),
    ('ENVIADO', 'La orden salió del almacén y está en tránsito.'),
    ('ENTREGADO', 'La orden fue entregada al cliente.'),
    ('CANCELADO', 'La orden se canceló y no continuará su flujo.'),
)


def seed_payment_methods(apps, schema_editor):
    PaymentMethod = apps.get_model('orders', 'PaymentMethod')
    for name, is_active in PAYMENT_METHODS:
        PaymentMethod.objects.update_or_create(
            name=name,
            defaults={'is_active': is_active},
        )


def unseed_payment_methods(apps, schema_editor):
    PaymentMethod = apps.get_model('orders', 'PaymentMethod')
    PaymentMethod.objects.filter(name__in=[name for name, _ in PAYMENT_METHODS]).delete()


def seed_order_statuses(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    for name, description in ORDER_STATUSES:
        OrderStatus.objects.update_or_create(
            name=name,
            defaults={'description': description},
        )


def unseed_order_statuses(apps, schema_editor):
    OrderStatus = apps.get_model('orders', 'OrderStatus')
    OrderStatus.objects.filter(name__in=[name for name, _ in ORDER_STATUSES]).delete()


def seed_catalogs(apps, schema_editor):
    seed_order_statuses(apps, schema_editor)
    seed_payment_methods(apps, schema_editor)


def unseed_catalogs(apps, schema_editor):
    unseed_payment_methods(apps, schema_editor)
    unseed_order_statuses(apps, schema_editor)


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0004_update_order_status_names'),
    ]

    operations = [
        migrations.RunPython(seed_catalogs, unseed_catalogs),
    ]

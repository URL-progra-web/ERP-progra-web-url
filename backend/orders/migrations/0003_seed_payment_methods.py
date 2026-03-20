from django.db import migrations


PAYMENT_METHODS = (
    ('EFECTIVO', True),
    ('TRANSFERENCIA', True),
    ('PAGO CONTRA ENTREGA', True),
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


class Migration(migrations.Migration):
    dependencies = [
        ('orders', '0002_initial'),
    ]

    operations = [
        migrations.RunPython(seed_payment_methods, unseed_payment_methods),
    ]

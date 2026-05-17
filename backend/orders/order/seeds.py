from decimal import Decimal

from core.seeds import BaseSeeder
from crm.customer.models.models import Customer
from orders.order.models.models import Order
from orders.order_item.models.models import OrderItem
from orders.order_status.models.models import OrderStatus
from orders.payment_method.models.models import PaymentMethod
from products.variant.models.models import ProductVariant


class OrderSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        customers = list(Customer.objects.order_by('id')[:4])
        if not customers:
            print('No customers found. Skipping order seeder.')
            return

        payment_method = PaymentMethod.objects.filter(is_active=True).order_by('id').first()
        if not payment_method:
            print('No payment methods found. Skipping order seeder.')
            return

        status_map = {
            name: OrderStatus.objects.filter(name=name).first()
            for name in ['SOLICITADO', 'CONFIRMADO', 'ENVIADO', 'ENTREGADO']
        }

        if not all(status_map.values()):
            print('Missing order statuses. Expected SOLICITADO, CONFIRMADO, ENVIADO, ENTREGADO.')
            return

        variants = list(ProductVariant.objects.select_related('product__base_uom').order_by('id')[:4])
        if not variants:
            print('No product variants found. Orders will be created without items.')

        from datetime import timedelta
        import random

        from django.utils import timezone

        now = timezone.now()

        for idx in range(1, 151):
            days_ago = random.randint(0, 45)
            created_at = now - timedelta(days=days_ago)
            quantity_factor = random.randint(1, 5)
            status = status_map['ENTREGADO']
            customer = random.choice(customers)

            order, created = Order.objects.update_or_create(
                short_id=f'PED-SIM-{idx:04d}',
                defaults={
                    'customer': customer,
                    'payment_method': payment_method,
                    'status': status,
                    'shipping_address': f'Zona Ficticia {quantity_factor}, Ciudad Demo',
                    'shipping_cost': Decimal('15.00') + Decimal(str(quantity_factor)),
                    'notes': f'Pedido simulado en fecha {created_at.date()}',
                },
            )

            if created or order.created_at.date() != created_at.date():
                Order.objects.filter(id=order.id).update(created_at=created_at)

            if variants:
                variant = variants[(idx - 1) % len(variants)]
                base_uom = variant.product.base_uom
                quantity = Decimal(str(quantity_factor)).quantize(Decimal('1.0000'))

                OrderItem.objects.update_or_create(
                    order=order,
                    variant=variant,
                    defaults={
                        'selected_uom': base_uom,
                        'base_uom': base_uom,
                        'quantity': quantity,
                        'conversion_multiplier': Decimal('1.0000'),
                        'base_quantity': quantity,
                        'unit_cost': variant.cost,
                        'unit_price': variant.price,
                        'status': status,
                    },
                )

            print(f"{'Created' if created else 'Updated'} order: {order.short_id} ({status.name}) on {created_at.date()}")

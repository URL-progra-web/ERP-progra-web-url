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
        from django.utils import timezone
        import random

        base_orders = []
        now = timezone.now()

        # Generar 150 órdenes ficticias distribuidas en los últimos 45 días
        for idx in range(1, 151):
            days_ago = random.randint(0, 45)
            # Pesos para la probabilidad de estados, predominando ENTREGADO
            status_choice = random.choices(
                ['ENTREGADO', 'ENVIADO', 'CONFIRMADO', 'SOLICITADO', 'CANCELADO'],
                weights=[60, 15, 10, 10, 5]
            )[0]
            
            # El usuario pidió TODAS en ENTREGADO, así que las dejaremos como ENTREGADO
            status_choice = 'ENTREGADO'

            base_orders.append({
                'short_id': f'PED-SIM-{idx:04d}',
                'status_name': status_choice,
                'created_at': now - timedelta(days=days_ago),
                'quantity_factor': random.randint(1, 5)
            })

        for order_data in base_orders:
            status = status_map.get(order_data['status_name'])
            if not status:
                continue
                
            customer = random.choice(customers)

            order, created = Order.objects.update_or_create(
                short_id=order_data['short_id'],
        base_orders = [
            ('PED-SEED-0001', 'SOLICITADO', 1),
            ('PED-SEED-0002', 'CONFIRMADO', 2),
            ('PED-SEED-0003', 'ENVIADO', 3),
            ('PED-SEED-0004', 'ENTREGADO', 4),
        ]

        delivered_orders = [
            ('PED-ENT-0001', 'ENTREGADO', 2),
            ('PED-ENT-0002', 'ENTREGADO', 3),
            ('PED-ENT-0003', 'ENTREGADO', 4),
            ('PED-ENT-0004', 'ENTREGADO', 5),
        ]

        for idx, (short_id, status_name, quantity_factor) in enumerate(base_orders + delivered_orders, start=1):
            status = status_map[status_name]
            customer = customers[(idx - 1) % len(customers)]

            order, created = Order.objects.update_or_create(
                short_id=short_id,
                defaults={
                    'customer': customer,
                    'payment_method': payment_method,
                    'status': status,
                    'shipping_address': f'Zona Ficticia {order_data["quantity_factor"]}, Ciudad Demo',
                    'shipping_cost': Decimal('15.00') + Decimal(str(order_data["quantity_factor"])),
                    'notes': f'Pedido simulado en fecha {order_data["created_at"].date()}',
                },
            )

            # Para overridear el auto_now_add de created_at, se hace por .update()
            if created or order.created_at.date() != order_data['created_at'].date():
                Order.objects.filter(id=order.id).update(created_at=order_data['created_at'])

            print(f"{'Created' if created else 'Updated'} order: {order.short_id} ({status.name}) on {order_data['created_at'].date()}")
                    'shipping_address': f'Zona {idx}, Ciudad Demo',
                    'shipping_cost': Decimal('15.00') + Decimal(str(idx)),
                    'notes': f'Pedido seed en estado {status.name}',
                },
            )

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

            print(f"{'Created' if created else 'Updated'} order: {short_id} ({status.name})")

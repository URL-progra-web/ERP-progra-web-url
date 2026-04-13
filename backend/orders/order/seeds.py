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

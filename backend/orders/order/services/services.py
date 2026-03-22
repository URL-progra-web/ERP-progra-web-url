import random
import string

from django.db import transaction

from orders.order.models.models import Order
from orders.order_status.models.models import OrderStatus

def generate_short_id():
    # E.g., ORD-ABC12
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"ORD-{random_str}"

def get_orders():
    return Order.objects.all().order_by('-created_at')

@transaction.atomic
def create_order(customer_id, status_id=None, payment_method_id=None, short_id=None, shipping_address=None, shipping_cost=0.00, notes=None):
    if not short_id:
        while True:
            short_id = generate_short_id()
            if not Order.objects.filter(short_id=short_id).exists():
                break

    if not status_id:
        status_obj = OrderStatus.objects.filter(name__iexact='SOLICITADO').first()
        if not status_obj:
            status_obj = OrderStatus.objects.filter(name__iexact='BORRADOR').first()
        if not status_obj:
            status_obj = OrderStatus.objects.create(name='BORRADOR', description='Estado inicial')
        status_id = status_obj

    order = Order.objects.create(
        short_id=short_id,
        customer=customer_id,
        status=status_id,
        payment_method=payment_method_id,
        shipping_address=shipping_address,
        shipping_cost=shipping_cost,
        notes=notes
    )
    return order

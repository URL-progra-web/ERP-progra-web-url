from crm.customer.models.models import Customer
from orders.payment_method.models.models import PaymentMethod


def get_order_catalogs():
    customers = Customer.objects.order_by('name')
    payment_methods = PaymentMethod.objects.filter(is_active=True).order_by('name')
    return customers, payment_methods

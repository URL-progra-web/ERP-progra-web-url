from django.test import TestCase

from crm.customer.models.models import Customer
from orders.order.models.models import Order
from orders.order_status.models.models import OrderStatus
from orders.order_status.services.services import OrderStatusService
from orders.order_status.exceptions import InvalidOrderStatusTransition, OrderAlreadyTerminal, OrderStatusInUse
from orders.order_history.models.models import OrderStatusHistory
from orders.payment_method.models.models import PaymentMethod
from orders.payment_method.services.services import PaymentMethodService
from orders.payment_method.exceptions import PaymentMethodAlreadyExists, PaymentMethodInUse


class PaymentMethodServiceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = Customer.objects.create(name='Guest', phone='555-0100')
        cls.status = OrderStatus.objects.create(name='PM_STATUS')

    def setUp(self):
        self.service = PaymentMethodService()

    def test_create_duplicate_name_is_blocked(self):
        self.service.create_method('Cash')
        with self.assertRaises(PaymentMethodAlreadyExists):
            self.service.create_method('cash')

    def test_delete_method_in_use_raises(self):
        method = self.service.create_method('Card')
        Order.objects.create(
            short_id='PM-ORDER-1',
            customer=self.customer,
            payment_method=method,
            status=self.status,
        )
        with self.assertRaises(PaymentMethodInUse):
            self.service.delete_method(method.id)

    def test_update_method_status_works(self):
        method = self.service.create_method('Bank Transfer', is_active=True)
        updated = self.service.update_method(method.id, is_active=False)
        self.assertFalse(updated.is_active)

    def test_update_method_rename_fails(self):
        method = self.service.create_method('Check')
        with self.assertRaises(ValueError):
            self.service.update_method(method.id, name='New Check')


class OrderStatusServiceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.requested = OrderStatus.objects.get(name='SOLICITADO')
        cls.confirmed = OrderStatus.objects.get(name='CONFIRMADO')
        cls.shipped = OrderStatus.objects.get(name='ENVIADO')
        cls.delivered = OrderStatus.objects.get(name='ENTREGADO')
        cls.cancelled = OrderStatus.objects.get(name='CANCELADO')
        cls.customer = Customer.objects.create(name='Workflow Guest', phone='555-0200')
        cls.payment_method = PaymentMethod.objects.get(name='TRANSFERENCIA')

    def setUp(self):
        self.service = OrderStatusService()

    def _create_order(self, short_id='WF-ORDER'):  # helper
        return Order.objects.create(
            short_id=short_id,
            customer=self.customer,
            payment_method=self.payment_method,
            status=self.requested,
        )

    def test_valid_transition_changes_status_and_creates_history(self):
        order = self._create_order(short_id='WF-1')
        updated = self.service.transition_order(order.id, 'CONFIRMADO', actor=None, notes='Approve')
        self.assertEqual(updated.status.name, 'CONFIRMADO')
        self.assertEqual(OrderStatusHistory.objects.filter(order=order).count(), 1)

    def test_invalid_transition_is_rejected(self):
        order = self._create_order(short_id='WF-2')
        with self.assertRaises(InvalidOrderStatusTransition):
            self.service.transition_order(order.id, 'ENTREGADO', actor=None)

    def test_delivered_order_is_terminal(self):
        order = Order.objects.create(
            short_id='WF-3',
            customer=self.customer,
            payment_method=self.payment_method,
            status=self.delivered,
        )
        with self.assertRaises(OrderAlreadyTerminal):
            self.service.transition_order(order.id, 'CONFIRMADO', actor=None)

    def test_delete_status_in_use_fails(self):
        order = self._create_order(short_id='WF-4')
        with self.assertRaises(OrderStatusInUse):
            self.service.delete_status(self.requested.id)

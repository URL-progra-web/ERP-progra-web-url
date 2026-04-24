from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone

from crm.customer.models.models import Customer
from crm.entrepreneur.models.models import Entrepreneur
from inventory.business_unit.models.models import BusinessUnit
from inventory.transaction.models.models import InventoryTransaction
from inventory.transaction_type.models.models import TransactionType
from inventory.uom.models.models import UoM
from orders.order.models.models import Order
from orders.order_notification.models.models import OrderNotification
from orders.order_notification.services.services import OrderNotificationService
from orders.order.services.services import OrderService
from orders.order.exceptions import OrderDeleteNotAllowed
from orders.order_item.models.models import OrderItem
from orders.order_status.models.models import OrderStatus
from orders.order_status.services.services import OrderStatusService
from orders.order_status.exceptions import InvalidOrderStatusTransition, OrderAlreadyTerminal, OrderStatusInUse
from orders.order_item.exceptions import OrderItemStockUnavailable
from orders.order_history.models.models import OrderStatusHistory
from orders.payment_method.models.models import PaymentMethod
from orders.payment_method.services.services import PaymentMethodService
from orders.payment_method.exceptions import PaymentMethodAlreadyExists, PaymentMethodInUse
from products.product.models.models import Product
from products.variant.models.models import ProductVariant


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
        cls.draft, _ = OrderStatus.objects.get_or_create(
            name='BORRADOR',
            defaults={'description': 'Pedido creado, pendiente de revision'},
        )
        cls.requested = OrderStatus.objects.get(name='SOLICITADO')
        cls.confirmed = OrderStatus.objects.get(name='CONFIRMADO')
        cls.shipped = OrderStatus.objects.get(name='ENVIADO')
        cls.delivered = OrderStatus.objects.get(name='ENTREGADO')
        cls.cancelled = OrderStatus.objects.get(name='CANCELADO')
        cls.customer = Customer.objects.create(name='Workflow Guest', phone='555-0200')
        cls.payment_method = PaymentMethod.objects.get(name='TRANSFERENCIA')
        cls.entrepreneur = Entrepreneur.objects.create(company_name='Workflow Ent', contact_name='Owner')
        cls.business_unit = BusinessUnit.objects.create(name='Workflow BU')
        cls.uom = UoM.objects.create(code='UN', name='Unidad')
        cls.product = Product.objects.create(
            entrepreneur=cls.entrepreneur,
            business_unit=cls.business_unit,
            name='Workflow Product',
        )
        cls.variant = ProductVariant.objects.create(
            product=cls.product,
            sku='WF-SKU-1',
            uom=cls.uom,
            cost=10,
            price=20,
            quantity_available=20,
            is_active=True,
        )
        TransactionType.objects.update_or_create(
            name='Salida',
            defaults={'factor': -1, 'description': 'Salida por confirmacion de pedido'},
        )

    def setUp(self):
        self.service = OrderStatusService()
        self.order_service = OrderService()

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

    def test_draft_transition_to_requested_is_allowed(self):
        order = Order.objects.create(
            short_id='WF-DRAFT-1',
            customer=self.customer,
            payment_method=self.payment_method,
            status=self.draft,
        )
        updated = self.service.transition_order(order.id, 'SOLICITADO', actor=None, notes='Promote draft')
        self.assertEqual(updated.status.name, 'SOLICITADO')
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

    def test_delete_order_only_allowed_in_solicitado(self):
        order = self._create_order(short_id='WF-DEL-1')
        self.order_service.delete_order(order.id)
        self.assertFalse(Order.objects.filter(id=order.id).exists())

        draft_order = Order.objects.create(
            short_id='WF-DEL-0',
            customer=self.customer,
            payment_method=self.payment_method,
            status=self.draft,
        )
        self.order_service.delete_order(draft_order.id)
        self.assertFalse(Order.objects.filter(id=draft_order.id).exists())

        locked_order = Order.objects.create(
            short_id='WF-DEL-2',
            customer=self.customer,
            payment_method=self.payment_method,
            status=self.confirmed,
        )
        with self.assertRaises(OrderDeleteNotAllowed):
            self.order_service.delete_order(locked_order.id)

    def test_confirm_transition_reduces_stock_and_creates_inventory_transaction(self):
        order = self._create_order(short_id='WF-STOCK-1')
        OrderItem.objects.create(
            order=order,
            variant=self.variant,
            quantity=3,
            unit_cost=10,
            unit_price=20,
            status=self.requested,
        )

        updated = self.service.transition_order(order.id, 'CONFIRMADO', actor=None, notes='Confirm stock')

        self.variant.refresh_from_db()
        self.assertEqual(updated.status.name, 'CONFIRMADO')
        self.assertEqual(self.variant.quantity_available, 17)
        transaction = InventoryTransaction.objects.get(reference=order.short_id)
        self.assertEqual(transaction.transaction_type_id, 'Salida')
        self.assertEqual(transaction.quantity, 3)

    def test_confirm_transition_bootstraps_output_transaction_type_if_missing(self):
        TransactionType.objects.filter(name='Salida').delete()
        order = self._create_order(short_id='WF-STOCK-BOOT')
        OrderItem.objects.create(
            order=order,
            variant=self.variant,
            quantity=2,
            unit_cost=10,
            unit_price=20,
            status=self.requested,
        )

        updated = self.service.transition_order(order.id, 'CONFIRMADO', actor=None, notes='Confirm stock')

        self.assertEqual(updated.status.name, 'CONFIRMADO')
        self.assertTrue(TransactionType.objects.filter(name='Salida', factor=-1).exists())
        self.assertTrue(InventoryTransaction.objects.filter(reference=order.short_id).exists())

    def test_confirm_transition_with_insufficient_stock_keeps_order_pending(self):
        order = self._create_order(short_id='WF-STOCK-2')
        OrderItem.objects.create(
            order=order,
            variant=self.variant,
            quantity=30,
            unit_cost=10,
            unit_price=20,
            status=self.requested,
        )

        with self.assertRaises(OrderItemStockUnavailable):
            self.service.transition_order(order.id, 'CONFIRMADO', actor=None, notes='Should fail')

        order.refresh_from_db()
        self.variant.refresh_from_db()
        self.assertEqual(order.status.name, 'SOLICITADO')
        self.assertEqual(self.variant.quantity_available, 20)
        self.assertFalse(InventoryTransaction.objects.filter(reference=order.short_id).exists())

    def test_cancel_transition_restores_stock_for_confirmed_order(self):
        order = self._create_order(short_id='WF-CANCEL-1')
        OrderItem.objects.create(
            order=order,
            variant=self.variant,
            quantity=4,
            unit_cost=10,
            unit_price=20,
            status=self.requested,
        )

        self.service.transition_order(order.id, 'CONFIRMADO', actor=None, notes='Confirm first')
        cancelled = self.service.transition_order(order.id, 'CANCELADO', actor=None, notes='Cancel later')

        order.refresh_from_db()
        self.variant.refresh_from_db()
        self.assertEqual(cancelled.status.name, 'CANCELADO')
        self.assertEqual(order.status.name, 'CANCELADO')
        self.assertEqual(self.variant.quantity_available, 20)
        self.assertTrue(TransactionType.objects.filter(name='Entrada', factor=1).exists())
        self.assertEqual(InventoryTransaction.objects.filter(reference=order.short_id).count(), 2)
        self.assertTrue(
            InventoryTransaction.objects.filter(reference=order.short_id, transaction_type_id='Entrada').exists()
        )


class OrderServiceShortIdTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = Customer.objects.create(name='ShortId Guest', phone='555-0300')
        cls.requested = OrderStatus.objects.get(name='SOLICITADO')

    def setUp(self):
        self.service = OrderService()

    @patch('orders.order.services.services.localdate', return_value=date(2026, 3, 26))
    def test_create_order_generates_daily_sequence_short_id(self, _mock_localdate):
        first_order = self.service.create_order(customer=self.customer, status=self.requested)
        second_order = self.service.create_order(customer=self.customer, status=self.requested)

        self.assertEqual(first_order.short_id, 'ORD-260326-00001')
        self.assertEqual(second_order.short_id, 'ORD-260326-00002')

    @patch('orders.order.services.services.localdate', return_value=date(2026, 3, 27))
    def test_create_order_resets_sequence_each_day(self, _mock_localdate):
        Order.objects.create(
            short_id='ORD-260326-00009',
            customer=self.customer,
            status=self.requested,
        )

        order = self.service.create_order(customer=self.customer, status=self.requested)

        self.assertEqual(order.short_id, 'ORD-260327-00001')

    @patch('orders.order.services.services.localdate', return_value=date(2026, 3, 26))
    def test_create_order_skips_to_next_available_daily_sequence(self, _mock_localdate):
        Order.objects.create(
            short_id='ORD-260326-00007',
            customer=self.customer,
            status=self.requested,
        )

        order = self.service.create_order(customer=self.customer, status=self.requested)

        self.assertEqual(order.short_id, 'ORD-260326-00008')


class OrderNotificationServiceTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.customer = Customer.objects.create(name='Notification Guest', phone='555-0400')
        cls.draft_status, _ = OrderStatus.objects.get_or_create(
            name='BORRADOR',
            defaults={'description': 'Pedido creado por cliente, pendiente de revisión'},
        )
        cls.requested_status, _ = OrderStatus.objects.get_or_create(
            name='SOLICITADO',
            defaults={'description': 'La orden fue creada y espera confirmación.'},
        )

    def test_create_new_public_order_notification_generates_message(self):
        order = Order.objects.create(short_id='ORD-NOTIF-1', customer=self.customer, status=self.draft_status)

        notification = OrderNotificationService.create_new_public_order_notification(order)

        self.assertEqual(notification.order_id, order.id)
        self.assertEqual(notification.title, 'Nuevo pedido en tienda online')
        self.assertIn(order.short_id, notification.message)

    def test_purge_expired_notifications_deletes_records_older_than_retention(self):
        order = Order.objects.create(short_id='ORD-NOTIF-2', customer=self.customer, status=self.draft_status)
        expired = OrderNotification.objects.create(
            order=order,
            title='Vencida',
            message='Notificación fuera de ventana',
        )
        recent = OrderNotification.objects.create(
            order=order,
            title='Reciente',
            message='Notificación vigente',
        )

        threshold = timezone.now() - timedelta(days=61)
        OrderNotification.objects.filter(id=expired.id).update(created_at=threshold)

        deleted_count = OrderNotificationService.purge_expired_notifications()

        self.assertEqual(deleted_count, 1)
        self.assertFalse(OrderNotification.objects.filter(id=expired.id).exists())
        self.assertTrue(OrderNotification.objects.filter(id=recent.id).exists())

    def test_list_notifications_only_returns_draft_orders(self):
        draft_order = Order.objects.create(short_id='ORD-NOTIF-3', customer=self.customer, status=self.draft_status)
        requested_order = Order.objects.create(short_id='ORD-NOTIF-4', customer=self.customer, status=self.requested_status)

        draft_notification = OrderNotification.objects.create(
            order=draft_order,
            title='Borrador',
            message='Debe mostrarse en campana',
        )
        OrderNotification.objects.create(
            order=requested_order,
            title='Solicitado',
            message='No debe mostrarse en campana',
        )

        visible_notifications = list(OrderNotificationService.list_notifications())

        self.assertEqual(len(visible_notifications), 1)
        self.assertEqual(visible_notifications[0].id, draft_notification.id)

    def test_notification_stops_showing_after_order_leaves_draft(self):
        order = Order.objects.create(short_id='ORD-NOTIF-5', customer=self.customer, status=self.draft_status)
        notification = OrderNotification.objects.create(
            order=order,
            title='Nuevo pedido en tienda online',
            message='Pedido pendiente de revisión',
        )

        self.assertTrue(OrderNotificationService.list_notifications().filter(id=notification.id).exists())

        order.status = self.requested_status
        order.save(update_fields=['status'])

        self.assertFalse(OrderNotificationService.list_notifications().filter(id=notification.id).exists())
        self.assertTrue(OrderNotification.objects.filter(id=notification.id).exists())

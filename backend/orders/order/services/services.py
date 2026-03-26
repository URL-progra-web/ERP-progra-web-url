import random
import string
from decimal import Decimal
from typing import Optional

from django.db import transaction

from orders.order.exceptions import (
    DuplicateOrderShortId,
    OrderDeleteNotAllowed,
    InvalidOrderData,
    OrderNotFound,
    OrderStatusDefaultNotConfigured,
)
from orders.order.repositories.repositories import OrderRepository
from orders.order_status.models.models import OrderStatus


class OrderService:
    def __init__(self, repository: Optional[OrderRepository] = None, order_item_service=None):
        self.repository = repository or OrderRepository()
        self.order_item_service = order_item_service

    @staticmethod
    def _generate_short_id() -> str:
        random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
        return f"ORD-{random_str}"

    def _build_unique_short_id(self) -> str:
        for _ in range(20):
            candidate = self._generate_short_id()
            if not self.repository.exists_by_short_id(candidate):
                return candidate
        raise DuplicateOrderShortId('No se pudo generar un short_id único para la orden')

    @staticmethod
    def _get_default_status() -> OrderStatus:
        status = OrderStatus.objects.filter(name__iexact='SOLICITADO').first()
        if status:
            return status

        status = OrderStatus.objects.filter(name__iexact='BORRADOR').first()
        if status:
            return status

        raise OrderStatusDefaultNotConfigured(
            'No existe un estado inicial para las órdenes (SOLICITADO o BORRADOR)'
        )

    def list_orders(self):
        return self.repository.list()

    def get_order(self, order_id: int):
        order = self.repository.get_by_id(order_id)
        if not order:
            raise OrderNotFound(f'No se encontró la orden con id {order_id}')
        return order

    @transaction.atomic
    def create_order(
        self,
        customer,
        status: Optional[OrderStatus] = None,
        payment_method=None,
        shipping_address: Optional[str] = None,
        shipping_cost: Decimal = Decimal('0.00'),
        notes: Optional[str] = None,
    ):
        short_id = self._build_unique_short_id()

        status = status or self._get_default_status()

        return self.repository.create(
            short_id=short_id,
            customer=customer,
            status=status,
            payment_method=payment_method,
            shipping_address=shipping_address,
            shipping_cost=shipping_cost,
            notes=notes,
        )

    @transaction.atomic
    def create_order_with_items(
        self,
        customer,
        items_payload: list[dict],
        status: Optional[OrderStatus] = None,
        payment_method=None,
        shipping_address: Optional[str] = None,
        shipping_cost: Decimal = Decimal('0.00'),
        notes: Optional[str] = None,
    ):
        if not self.order_item_service:
            raise InvalidOrderData('OrderItemService no está configurado para creación atómica de orden')
        if not items_payload:
            raise InvalidOrderData('Debes enviar al menos un item para crear la orden')

        order = self.create_order(
            customer=customer,
            status=status,
            payment_method=payment_method,
            shipping_address=shipping_address,
            shipping_cost=shipping_cost,
            notes=notes,
        )

        self.order_item_service.create_items_for_order(order_id=order.id, items_payload=items_payload)
        return order

    @transaction.atomic
    def update_order(
        self,
        order_id: int,
        customer=None,
        status: Optional[OrderStatus] = None,
        payment_method=None,
        shipping_address: Optional[str] = None,
        shipping_cost: Optional[Decimal] = None,
        notes: Optional[str] = None,
    ):
        order = self.get_order(order_id)

        updates = {}
        if customer is not None:
            updates['customer'] = customer
        if status is not None:
            updates['status'] = status
        if payment_method is not None:
            updates['payment_method'] = payment_method
        if shipping_address is not None:
            updates['shipping_address'] = shipping_address
        if shipping_cost is not None:
            updates['shipping_cost'] = shipping_cost
        if notes is not None:
            updates['notes'] = notes

        if not updates:
            raise InvalidOrderData('No se enviaron campos para actualizar la orden')

        return self.repository.update(order, **updates)

    @transaction.atomic
    def delete_order(self, order_id: int) -> None:
        order = self.get_order(order_id)
        if order.status.name.upper() != 'SOLICITADO':
            raise OrderDeleteNotAllowed('Solo se pueden eliminar pedidos en estado SOLICITADO')
        self.repository.delete(order)


order_service = OrderService()


def get_orders():
    return order_service.list_orders()


def create_order(
    customer_id,
    status_id=None,
    payment_method_id=None,
    shipping_address=None,
    shipping_cost=Decimal('0.00'),
    notes=None,
):
    return order_service.create_order(
        customer=customer_id,
        status=status_id,
        payment_method=payment_method_id,
        shipping_address=shipping_address,
        shipping_cost=shipping_cost,
        notes=notes,
    )

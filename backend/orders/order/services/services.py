from decimal import Decimal
from typing import Optional

from django.db import IntegrityError, transaction
from django.utils.timezone import localdate

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
    SHORT_ID_PREFIX = 'ORD'
    DAILY_SEQUENCE_DIGITS = 5
    MAX_SHORT_ID_ATTEMPTS = 20

    def __init__(self, repository: Optional[OrderRepository] = None, order_item_service=None):
        self.repository = repository or OrderRepository()
        self.order_item_service = order_item_service

    @classmethod
    def _build_short_id_prefix(cls, order_date) -> str:
        return f"{cls.SHORT_ID_PREFIX}-{order_date.strftime('%y%m%d')}-"

    @classmethod
    def _extract_sequence_number(cls, short_id: str, prefix: str) -> int:
        suffix = short_id.removeprefix(prefix)
        return int(suffix) if suffix.isdigit() else 0

    def _build_next_short_id(self, order_date) -> str:
        prefix = self._build_short_id_prefix(order_date)
        last_short_id = self.repository.get_last_short_id_by_prefix(prefix)
        next_sequence = self._extract_sequence_number(last_short_id, prefix) + 1 if last_short_id else 1
        max_sequence = (10 ** self.DAILY_SEQUENCE_DIGITS) - 1

        if next_sequence > max_sequence:
            raise DuplicateOrderShortId(
                f'Se alcanzó el máximo diario de pedidos para {order_date.strftime("%Y-%m-%d")}'
            )

        return f"{prefix}{next_sequence:0{self.DAILY_SEQUENCE_DIGITS}d}"

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
        status = status or self._get_default_status()
        order_date = localdate()

        for _ in range(self.MAX_SHORT_ID_ATTEMPTS):
            short_id = self._build_next_short_id(order_date)
            try:
                return self.repository.create(
                    short_id=short_id,
                    customer=customer,
                    status=status,
                    payment_method=payment_method,
                    shipping_address=shipping_address,
                    shipping_cost=shipping_cost,
                    notes=notes,
                )
            except IntegrityError:
                continue

        raise DuplicateOrderShortId('No se pudo generar un short_id único para la orden')

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

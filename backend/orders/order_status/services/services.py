from typing import Dict, Iterable, Optional, Sequence

from django.db import transaction

from orders.order.exceptions import OrderNotFound
from orders.order_item.exceptions import OrderItemStockUnavailable
from inventory.transaction.services.services import InventoryTransactionService
from orders.order.repositories.repositories import OrderRepository
from orders.order_history.repositories.repositories import OrderStatusHistoryRepository
from orders.order_status.exceptions import (
    InvalidOrderStatusTransition,
    OrderAlreadyTerminal,
    OrderStatusInUse,
    OrderStatusNotFound,
)
from orders.order_status.models.models import OrderStatus
from orders.order_status.repositories.repositories import OrderStatusRepository
from orders.order_history.models.models import OrderStatusHistory
from users.user.models.models import User


class OrderStatusService:
    allowed_transitions: Dict[str, Sequence[str]] = {
        'SOLICITADO': ('CONFIRMADO',),
        'CONFIRMADO': ('ENVIADO', 'CANCELADO'),
        'ENVIADO': ('ENTREGADO',),
        'ENTREGADO': tuple(),
        'CANCELADO': tuple(),
    }
    terminal_statuses = {'ENTREGADO', 'CANCELADO'}

    def __init__(
        self,
        repository: Optional[OrderStatusRepository] = None,
        order_repository: Optional[OrderRepository] = None,
        history_repository: Optional[OrderStatusHistoryRepository] = None,
        inventory_transaction_service: Optional[InventoryTransactionService] = None,
    ):
        self.repository = repository or OrderStatusRepository()
        self.order_repository = order_repository or OrderRepository()
        self.history_repository = history_repository or OrderStatusHistoryRepository()
        self.inventory_transaction_service = inventory_transaction_service or InventoryTransactionService()

    @staticmethod
    def _validate_confirmation_stock(order) -> None:
        items = list(order.items.select_related('variant').all())
        if not items:
            raise OrderItemStockUnavailable(f'La orden {order.short_id} no tiene items para confirmar')

        for item in items:
            available = int(item.variant.quantity_available or 0)
            if available < item.quantity:
                raise OrderItemStockUnavailable(
                    f'Stock insuficiente para {item.variant.sku}. Disponible: {available}, solicitado: {item.quantity}'
                )

    def _apply_confirmation_inventory(self, order, actor: Optional[User], notes: Optional[str]) -> None:
        self._validate_confirmation_stock(order)

        for item in order.items.select_related('variant').all():
            self.inventory_transaction_service.create_transaction(
                variant_id=item.variant_id,
                transaction_type_name='Salida',
                quantity=item.quantity,
                user=actor,
                reference=order.short_id,
                notes=notes or f'Confirmacion de pedido {order.short_id}',
            )

    def list_statuses(self, search: Optional[str] = None):
        return self.repository.list(search=search)

    def get_status(self, status_id: int) -> OrderStatus:
        status = self.repository.get_by_id(status_id)
        if not status:
            raise OrderStatusNotFound(f"El estado con id {status_id} no existe")
        return status

    def get_status_by_name(self, name: str) -> OrderStatus:
        normalized = name.strip().upper()
        status = self.repository.get_by_name(normalized)
        if not status:
            raise OrderStatusNotFound(f"No se encontró el estado '{normalized}'")
        return status

    def create_status(self, name: str, description: Optional[str] = None) -> OrderStatus:
        normalized = name.strip().upper()
        if not normalized:
            raise ValueError('El nombre no puede estar vacío')
        if self.repository.get_by_name(normalized):
            raise ValueError(f"El estado '{normalized}' ya existe")
        return self.repository.create(name=normalized, description=description)

    def update_status(self, status_id: int, name: Optional[str] = None, description: Optional[str] = None) -> OrderStatus:
        status = self.get_status(status_id)
        fields = {}
        if name is not None:
            normalized = name.strip().upper()
            if not normalized:
                raise ValueError('El nombre no puede estar vacío')
            existing = self.repository.get_by_name(normalized)
            if existing and existing.id != status.id:
                raise ValueError(f"El estado '{normalized}' ya existe")
            fields['name'] = normalized
        if description is not None:
            fields['description'] = description
        if not fields:
            return status
        return self.repository.update(status, **fields)

    def delete_status(self, status_id: int) -> None:
        status = self.get_status(status_id)
        if self.order_repository.exists_with_status(status):
            raise OrderStatusInUse('El estado está asignado a órdenes existentes')
        if OrderStatusHistory.objects.filter(status=status).exists():
            raise OrderStatusInUse('El estado aparece en el historial de órdenes')
        if status.name in self.allowed_transitions:
            if self.allowed_transitions.get(status.name):
                raise OrderStatusInUse('No se puede eliminar un estado que participa en el flujo de transición')
        self.repository.delete(status)

    def get_allowed_next(self, current_status_name: str) -> Sequence[str]:
        return self.allowed_transitions.get(current_status_name.upper(), tuple())

    def transition_order(
        self,
        order_id: int,
        target_status_name: str,
        actor: Optional[User] = None,
        notes: Optional[str] = None,
    ):
        if actor is not None and not isinstance(actor, User):
            raise ValueError('El actor debe ser una instancia de usuario o None')

        order = self.order_repository.get_by_id(order_id)
        if not order:
            raise OrderNotFound(f'No se encontró la orden {order_id}')

        current_status_name = order.status.name.upper()
        if current_status_name in self.terminal_statuses:
            raise OrderAlreadyTerminal(f'La orden {order.short_id} está {current_status_name} y no puede cambiar de estado')

        target_status = self.get_status_by_name(target_status_name)
        if target_status.name == current_status_name:
            raise InvalidOrderStatusTransition(f'La orden {order.short_id} ya tiene el estado {target_status.name}')

        allowed_next = self.get_allowed_next(current_status_name)
        if target_status.name not in allowed_next:
            allowed_display = ', '.join(allowed_next) or 'sin estados siguientes'
            raise InvalidOrderStatusTransition(
                f"No es posible pasar de {current_status_name} a {target_status.name} para la orden {order.short_id}. Permitidos: {allowed_display}."
            )

        with transaction.atomic():
            if current_status_name == 'SOLICITADO' and target_status.name == 'CONFIRMADO':
                self._apply_confirmation_inventory(order, actor=actor, notes=notes)
            self.order_repository.update_status(order, target_status)
            self.history_repository.create(order=order, status=target_status, user=actor, notes=notes)

        return order

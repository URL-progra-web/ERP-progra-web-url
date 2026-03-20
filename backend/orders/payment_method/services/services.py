from typing import Optional

from orders.payment_method.exceptions import (
    PaymentMethodAlreadyExists,
    PaymentMethodInUse,
    PaymentMethodNotFound,
)
from orders.payment_method.models.models import PaymentMethod
from orders.payment_method.repositories.repositories import PaymentMethodRepository
from orders.order.models.models import Order


class PaymentMethodService:
    def __init__(self, repository: Optional[PaymentMethodRepository] = None):
        self.repository = repository or PaymentMethodRepository()

    def list_methods(self, search: Optional[str] = None, is_active: Optional[bool] = None):
        return self.repository.list(search=search, is_active=is_active)

    def get_method(self, method_id: int) -> PaymentMethod:
        method = self.repository.get_by_id(method_id)
        if not method:
            raise PaymentMethodNotFound(f"No se encontró el método de pago {method_id}")
        return method

    def create_method(self, name: str, is_active: bool = True) -> PaymentMethod:
        normalized = name.strip()
        if not normalized:
            raise ValueError('El nombre no puede estar vacío')
        existing = self.repository.get_by_name(normalized)
        if existing:
            raise PaymentMethodAlreadyExists(f"El método de pago '{normalized}' ya existe")
        return self.repository.create(name=normalized, is_active=is_active)

    def update_method(self, method_id: int, name: Optional[str] = None, is_active: Optional[bool] = None) -> PaymentMethod:
        if name is not None:
            raise ValueError('Renombrar métodos de pago no está permitido')
        if is_active is None:
            raise ValueError('Debe especificar el nuevo estado activo')
        return self.set_active_state(method_id, is_active)

    def set_active_state(self, method_id: int, is_active: bool) -> PaymentMethod:
        method = self.get_method(method_id)
        if method.is_active == is_active:
            return method
        return self.repository.update(method, is_active=is_active)

    def delete_method(self, method_id: int) -> None:
        method = self.get_method(method_id)
        if Order.objects.filter(payment_method=method).exists():
            raise PaymentMethodInUse('El método de pago está asociado a órdenes existentes y no puede eliminarse')
        self.repository.delete(method)

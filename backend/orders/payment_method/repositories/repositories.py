from typing import Optional

from django.db.models import QuerySet

from orders.payment_method.models.models import PaymentMethod


class PaymentMethodRepository:
    """Data access layer for payment methods."""

    def list(self, search: Optional[str] = None, is_active: Optional[bool] = None) -> QuerySet:
        qs = PaymentMethod.objects.all()
        if search:
            qs = qs.filter(name__icontains=search)
        if is_active is not None:
            qs = qs.filter(is_active=is_active)
        return qs.order_by('name')

    def get_by_id(self, method_id: int) -> Optional[PaymentMethod]:
        return PaymentMethod.objects.filter(id=method_id).first()

    def get_by_name(self, name: str) -> Optional[PaymentMethod]:
        return PaymentMethod.objects.filter(name__iexact=name).first()

    def create(self, name: str, is_active: bool = True) -> PaymentMethod:
        return PaymentMethod.objects.create(name=name, is_active=is_active)

    def update(self, method: PaymentMethod, **fields) -> PaymentMethod:
        for attr, value in fields.items():
            setattr(method, attr, value)
        method.save()
        return method

    def delete(self, method: PaymentMethod) -> None:
        method.delete()

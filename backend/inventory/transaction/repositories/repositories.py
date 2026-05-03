from typing import Optional
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import QuerySet
from inventory.transaction.models.models import InventoryTransaction
from products.variant.models.models import ProductVariant
from users.user.models.models import User
from inventory.transaction_type.models.models import TransactionType

class InventoryTransactionRepository:
    def get_by_id(self, transaction_id: int) -> Optional[InventoryTransaction]:
        try:
            return InventoryTransaction.objects.select_related(
                'variant', 'user', 'transaction_type', 'selected_uom', 'base_uom'
            ).get(id=transaction_id)
        except ObjectDoesNotExist:
            return None

    def get_all(self) -> QuerySet[InventoryTransaction]:
        return InventoryTransaction.objects.select_related(
            'variant', 'user', 'transaction_type', 'selected_uom', 'base_uom'
        ).all()

    def get_filtered(self, variant_id: int = None, transaction_type_name: str = None, date_from: str = None, date_to: str = None):
        qs = InventoryTransaction.objects.select_related(
            'variant', 'user', 'transaction_type', 'selected_uom', 'base_uom'
        ).all()
        if variant_id is not None:
            qs = qs.filter(variant_id=variant_id)
        if transaction_type_name is not None:
            qs = qs.filter(transaction_type__name=transaction_type_name)
        if date_from is not None:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to is not None:
            qs = qs.filter(created_at__date__lte=date_to)
        return qs

    def create(self, variant: ProductVariant, user: User, transaction_type: TransactionType,
               selected_uom, base_uom, quantity, conversion_multiplier, base_quantity,
               reference: str = None, notes: str = None) -> InventoryTransaction:
        return InventoryTransaction.objects.create(
            variant=variant,
            user=user,
            transaction_type=transaction_type,
            selected_uom=selected_uom,
            base_uom=base_uom,
            quantity=quantity,
            conversion_multiplier=conversion_multiplier,
            base_quantity=base_quantity,
            reference=reference,
            notes=notes
        )

    def update(self, transaction: InventoryTransaction, **kwargs) -> InventoryTransaction:
        for key, value in kwargs.items():
            setattr(transaction, key, value)
        transaction.save()
        return transaction

    def delete(self, transaction: InventoryTransaction) -> None:
        transaction.delete()

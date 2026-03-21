from typing import Optional, List
from django.core.exceptions import ObjectDoesNotExist
from inventory.transaction.models.models import InventoryTransaction
from products.variant.models.models import ProductVariant
from users.user.models.models import User
from inventory.transaction_type.models.models import TransactionType

class InventoryTransactionRepository:
    def get_by_id(self, transaction_id: int) -> Optional[InventoryTransaction]:
        try:
            return InventoryTransaction.objects.get(id=transaction_id)
        except ObjectDoesNotExist:
            return None

    def get_all(self) -> List[InventoryTransaction]:
        return list(InventoryTransaction.objects.select_related('variant', 'user', 'transaction_type').all())

    def get_filtered(self, variant_id: int = None, transaction_type_name: str = None):
        qs = InventoryTransaction.objects.select_related('variant', 'user', 'transaction_type').all()
        if variant_id is not None:
            qs = qs.filter(variant_id=variant_id)
        if transaction_type_name is not None:
            qs = qs.filter(transaction_type__name=transaction_type_name)
        return qs

    def create(self, variant: ProductVariant, user: User, transaction_type: TransactionType, 
               quantity: int, reference: str = None, notes: str = None) -> InventoryTransaction:
        return InventoryTransaction.objects.create(
            variant=variant,
            user=user,
            transaction_type=transaction_type,
            quantity=quantity,
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

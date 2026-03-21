from typing import Optional, List
from inventory.transaction.models.models import InventoryTransaction
from products.variant.models.models import ProductVariant
from users.user.models.models import User
from inventory.transaction_type.models.models import TransactionType
from inventory.transaction.repositories.repositories import InventoryTransactionRepository

class InventoryTransactionService:
    def __init__(self, repository: InventoryTransactionRepository = None):
        self.repository = repository or InventoryTransactionRepository()

    def get_transaction(self, transaction_id: int) -> Optional[InventoryTransaction]:
        return self.repository.get_by_id(transaction_id)

    def list_transactions(self) -> List[InventoryTransaction]:
        return self.repository.get_all()

    def list_transactions_filtered(self, variant_id: int = None, transaction_type_name: str = None):
        return self.repository.get_filtered(variant_id=variant_id, transaction_type_name=transaction_type_name)

    def create_transaction(self, variant_id: int, transaction_type_name: str, quantity: int, 
                          user: User = None, reference: str = None, notes: str = None) -> InventoryTransaction:
        try:
            variant = ProductVariant.objects.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            raise ValueError(f"No se encontró la variante con id {variant_id}.")
        
        try:
            transaction_type = TransactionType.objects.get(name=transaction_type_name)
        except TransactionType.DoesNotExist:
            raise ValueError(f"No se encontró el tipo de transacción '{transaction_type_name}'.")
        
        new_stock = variant.quantity_available + (quantity * transaction_type.factor)
        variant.quantity_available = new_stock
        variant.save()
        
        return self.repository.create(
            variant=variant,
            user=user,
            transaction_type=transaction_type,
            quantity=quantity,
            reference=reference,
            notes=notes
        )

    def delete_transaction(self, transaction_id: int) -> None:
        transaction = self.get_transaction(transaction_id)
        if not transaction:
            raise ValueError(f"No se encontró la transacción con id {transaction_id}.")
        
        variant = transaction.variant
        new_stock = variant.quantity_available - (transaction.quantity * transaction_type.factor)
        variant.quantity_available = new_stock
        variant.save()
        
        self.repository.delete(transaction)

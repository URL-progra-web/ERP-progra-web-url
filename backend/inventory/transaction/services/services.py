from decimal import Decimal
from typing import Optional

from inventory.uom_conversion.models.models import UoMConversion
from inventory.uom.models.models import UoM
from inventory.transaction.models.models import InventoryTransaction
from products.variant.models.models import ProductVariant
from users.user.models.models import User
from inventory.transaction_type.models.models import TransactionType
from inventory.transaction.repositories.repositories import InventoryTransactionRepository
from django.db import transaction as db_transaction
from django.db.models import QuerySet

class InventoryTransactionService:
    def __init__(self, repository: InventoryTransactionRepository = None):
        self.repository = repository or InventoryTransactionRepository()

    def get_transaction(self, transaction_id: int) -> Optional[InventoryTransaction]:
        return self.repository.get_by_id(transaction_id)

    def list_transactions(self) -> QuerySet[InventoryTransaction]:
        return self.repository.get_all()

    def list_transactions_filtered(self, variant_id: int = None, transaction_type_name: str = None, date_from: str = None, date_to: str = None):
        return self.repository.get_filtered(variant_id=variant_id, transaction_type_name=transaction_type_name, date_from=date_from, date_to=date_to)

    @staticmethod
    def _resolve_conversion(selected_uom: UoM, base_uom: UoM) -> Decimal:
        if selected_uom.id == base_uom.id:
            return Decimal('1')

        conversion = UoMConversion.objects.filter(from_uom=selected_uom, to_uom=base_uom).first()
        if not conversion:
            raise ValueError(
                f"No existe conversión de '{selected_uom.code}' hacia '{base_uom.code}'."
            )
        return Decimal(str(conversion.multiplier))

    def create_transaction(self, variant_id: int, transaction_type_name: str, quantity,
                          selected_uom_id: int, user: User = None, reference: str = None, notes: str = None) -> InventoryTransaction:
        try:
            transaction_type = TransactionType.objects.get(name=transaction_type_name)
        except TransactionType.DoesNotExist:
            raise ValueError(f"No se encontró el tipo de transacción '{transaction_type_name}'.")

        with db_transaction.atomic():
            try:
                variant = ProductVariant.objects.select_related('product__base_uom').get(id=variant_id)
            except ProductVariant.DoesNotExist:
                raise ValueError(f"No se encontró la variante con id {variant_id}.")

            try:
                selected_uom = UoM.objects.get(id=selected_uom_id)
            except UoM.DoesNotExist:
                raise ValueError(f"No se encontró la UOM con id {selected_uom_id}.")

            normalized_quantity = Decimal(str(quantity))
            if normalized_quantity <= 0:
                raise ValueError('La cantidad debe ser mayor a cero.')

            base_uom = variant.product.base_uom
            conversion_multiplier = self._resolve_conversion(selected_uom, base_uom)
            base_quantity = normalized_quantity * conversion_multiplier

            new_inventory_transaction = self.repository.create(
                variant=variant,
                user=user,
                transaction_type=transaction_type,
                selected_uom=selected_uom,
                base_uom=base_uom,
                quantity=normalized_quantity,
                conversion_multiplier=conversion_multiplier,
                base_quantity=base_quantity,
                reference=reference,
                notes=notes
            )
            
            return new_inventory_transaction

    def delete_transaction(self, transaction_id: int) -> None:
        transaction_obj = self.get_transaction(transaction_id)
        if not transaction_obj:
            raise ValueError(f"No se encontró la transacción con id {transaction_id}.")
        
        with db_transaction.atomic():
            self.repository.delete(transaction_obj)

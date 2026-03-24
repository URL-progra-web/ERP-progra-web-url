from typing import Optional, List
from inventory.transaction_type.models.models import TransactionType
from inventory.transaction_type.repositories.repositories import TransactionTypeRepository
from django.db.models import QuerySet

class TransactionTypeService:
    def __init__(self, repository: TransactionTypeRepository = None):
        self.repository = repository or TransactionTypeRepository()

    def get_transaction_type(self, name: str) -> Optional[TransactionType]:
        return self.repository.get_by_id(name)

    def list_transaction_types(self) -> QuerySet[TransactionType]:
        return self.repository.get_all()

    def create_transaction_type(self, name: str, factor: int, description: str = None) -> TransactionType:
        if self.get_transaction_type(name):
            raise ValueError(f"Ya existe un tipo de transacción con el nombre {name}.")
        
        if factor not in [1, -1]:
            raise ValueError("El factor debe ser 1 (compras) o -1 (ventas).")
        
        return self.repository.create(name=name, factor=factor, description=description)

    def update_transaction_type(self, name: str, factor: int = None, description: str = None) -> TransactionType:
        transaction_type = self.get_transaction_type(name)
        if not transaction_type:
            raise ValueError(f"No se encontró el tipo de transacción con nombre {name}.")
        
        if factor is not None and factor not in [1, -1]:
            raise ValueError("El factor debe ser 1 (compras) o -1 (ventas).")
        
        kwargs = {}
        if factor is not None:
            kwargs['factor'] = factor
        if description is not None:
            kwargs['description'] = description
        
        return self.repository.update(transaction_type, **kwargs)

    def delete_transaction_type(self, name: str) -> None:
        transaction_type = self.get_transaction_type(name)
        if not transaction_type:
            raise ValueError(f"No se encontró el tipo de transacción con nombre {name}.")
        self.repository.delete(transaction_type)

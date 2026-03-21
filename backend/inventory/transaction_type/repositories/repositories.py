from typing import Optional, List
from django.core.exceptions import ObjectDoesNotExist
from inventory.transaction_type.models.models import TransactionType

class TransactionTypeRepository:
    def get_by_id(self, name: str) -> Optional[TransactionType]:
        try:
            return TransactionType.objects.get(name=name)
        except ObjectDoesNotExist:
            return None

    def get_all(self) -> List[TransactionType]:
        return list(TransactionType.objects.all())

    def create(self, name: str, factor: int, description: str = None) -> TransactionType:
        return TransactionType.objects.create(
            name=name,
            factor=factor,
            description=description
        )

    def update(self, transaction_type: TransactionType, **kwargs) -> TransactionType:
        for key, value in kwargs.items():
            setattr(transaction_type, key, value)
        transaction_type.save()
        return transaction_type

    def delete(self, transaction_type: TransactionType) -> None:
        transaction_type.delete()

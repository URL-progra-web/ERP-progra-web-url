from typing import Optional, List
from inventory.uom_conversion.models.models import UoMConversion
from inventory.uom_conversion.repositories.repositories import UomConversionRepository


class UomConversionService:
    def __init__(self, repository: UomConversionRepository = None):
        self.repository = repository or UomConversionRepository()

    def list_conversions(self, from_uom_id=None, to_uom_id=None) -> List[UoMConversion]:
        return self.repository.filter_by_uom(
            from_uom_id=from_uom_id,
            to_uom_id=to_uom_id
        )

    def get_conversion(self, conversion_id: int) -> Optional[UoMConversion]:
        return self.repository.get_by_id(conversion_id)

    def create_conversion(self, from_uom_id: int, to_uom_id: int, multiplier) -> UoMConversion:
        if float(multiplier) <= 0:
            raise ValueError("El multiplicador debe ser mayor a cero.")
        if int(from_uom_id) == int(to_uom_id) and float(multiplier) != 1.0:
            raise ValueError("Si la UOM origen y destino son la misma, el multiplicador debe ser 1.")
        if self.repository.pair_exists(from_uom_id, to_uom_id):
            raise ValueError("Ya existe una conversión para este par de UOMs.")
        return self.repository.create(
            from_uom_id=from_uom_id,
            to_uom_id=to_uom_id,
            multiplier=multiplier
        )

    def update_conversion(self, conversion_id: int, **kwargs) -> UoMConversion:
        conversion = self.repository.get_by_id(conversion_id)
        if not conversion:
            raise ValueError(f"Conversión con id {conversion_id} no encontrada.")
        
        from_id = int(kwargs.get('from_uom_id', conversion.from_uom_id))
        to_id = int(kwargs.get('to_uom_id', conversion.to_uom_id))
        multiplier = kwargs.get('multiplier', conversion.multiplier)

        if float(multiplier) <= 0:
            raise ValueError("El multiplicador debe ser mayor a cero.")
        if from_id == to_id and float(multiplier) != 1.0:
            raise ValueError("Si la UOM origen y destino son la misma, el multiplicador debe ser 1.")
            
        if self.repository.pair_exists(from_id, to_id, exclude_id=int(conversion_id)):
            raise ValueError("Ya existe una conversión para este par de UOMs.")
        return self.repository.update(conversion, **kwargs)

    def delete_conversion(self, conversion_id: int) -> None:
        conversion = self.repository.get_by_id(conversion_id)
        if not conversion:
            raise ValueError(f"Conversión con id {conversion_id} no encontrada.")
        self.repository.delete(conversion)

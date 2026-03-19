from typing import Optional, List
from inventory.uom.models.models import UoM
from inventory.uom.repositories.repositories import UomRepository


class UomService:
    def __init__(self, repository: UomRepository = None):
        self.repository = repository or UomRepository()

    def list_uoms(self) -> List[UoM]:
        return self.repository.get_all()

    def get_uom(self, uom_id: int) -> Optional[UoM]:
        return self.repository.get_by_id(uom_id)

    def get_uom_by_code(self, code: str) -> Optional[UoM]:
        return self.repository.get_by_code(code.strip().lower())

    def create_uom(self, code: str, name: str) -> UoM:
        code = code.strip().lower()
        if self.repository.get_by_code(code):
            raise ValueError(f"Ya existe una UOM con el código '{code}'.")
        return self.repository.create(code=code, name=name)

    def update_uom(self, uom_id: int, **kwargs) -> UoM:
        uom = self.repository.get_by_id(uom_id)
        if not uom:
            raise ValueError(f"UOM con id {uom_id} no encontrada.")
        if 'code' in kwargs:
            kwargs['code'] = kwargs['code'].strip().lower()
            existing = self.repository.get_by_code(kwargs['code'])
            if existing and existing.id != int(uom_id):
                raise ValueError(f"Ya existe una UOM con el código '{kwargs['code']}'.")
        return self.repository.update(uom, **kwargs)

    def delete_uom(self, uom_id: int) -> None:
        uom = self.repository.get_by_id(uom_id)
        if not uom:
            raise ValueError(f"UOM con id {uom_id} no encontrada.")
        if self.repository.has_conversions(uom_id):
            raise ValueError(
                "Esta UOM tiene conversiones asociadas. "
                "Elimina las conversiones primero antes de borrar la UOM."
            )
        self.repository.delete(uom)

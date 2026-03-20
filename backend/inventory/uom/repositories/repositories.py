from typing import Optional
from django.core.exceptions import ObjectDoesNotExist
from django.db.models import QuerySet
from inventory.uom.models.models import UoM
from inventory.uom_conversion.models.models import UoMConversion


class UomRepository:
    def get_all(self) -> QuerySet['UoM']:
        return UoM.objects.all().order_by('code')

    def get_by_id(self, uom_id: int) -> Optional[UoM]:
        try:
            return UoM.objects.get(id=uom_id)
        except ObjectDoesNotExist:
            return None

    def get_by_code(self, code: str) -> Optional[UoM]:
        try:
            return UoM.objects.get(code=code)
        except ObjectDoesNotExist:
            return None

    def create(self, code: str, name: str) -> UoM:
        return UoM.objects.create(code=code, name=name)

    def update(self, uom: UoM, **kwargs) -> UoM:
        for key, value in kwargs.items():
            setattr(uom, key, value)
        uom.save()
        return uom

    def delete(self, uom: UoM) -> None:
        uom.delete()

    def has_conversions(self, uom_id: int) -> bool:
        return (
            UoMConversion.objects.filter(from_uom_id=uom_id).exists()
            or UoMConversion.objects.filter(to_uom_id=uom_id).exists()
        )

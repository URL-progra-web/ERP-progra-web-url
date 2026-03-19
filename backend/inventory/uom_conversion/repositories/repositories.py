from typing import Optional, List
from django.core.exceptions import ObjectDoesNotExist
from inventory.uom_conversion.models.models import UoMConversion


class UomConversionRepository:
    def get_all(self) -> List[UoMConversion]:
        return list(
            UoMConversion.objects.select_related('from_uom', 'to_uom').all()
        )

    def get_by_id(self, conversion_id: int) -> Optional[UoMConversion]:
        try:
            return UoMConversion.objects.select_related(
                'from_uom', 'to_uom'
            ).get(id=conversion_id)
        except ObjectDoesNotExist:
            return None

    def filter_by_uom(self, from_uom_id=None, to_uom_id=None) -> List[UoMConversion]:
        qs = UoMConversion.objects.select_related('from_uom', 'to_uom')
        if from_uom_id:
            qs = qs.filter(from_uom_id=from_uom_id)
        if to_uom_id:
            qs = qs.filter(to_uom_id=to_uom_id)
        return list(qs)

    def pair_exists(self, from_uom_id: int, to_uom_id: int, exclude_id: int = None) -> bool:
        qs = UoMConversion.objects.filter(
            from_uom_id=from_uom_id, to_uom_id=to_uom_id
        )
        if exclude_id:
            qs = qs.exclude(id=exclude_id)
        return qs.exists()

    def create(self, from_uom_id: int, to_uom_id: int, multiplier) -> UoMConversion:
        conv = UoMConversion.objects.create(
            from_uom_id=from_uom_id,
            to_uom_id=to_uom_id,
            multiplier=multiplier,
        )
        return self.get_by_id(conv.id)

    def update(self, conversion: UoMConversion, **kwargs) -> UoMConversion:
        for key, value in kwargs.items():
            setattr(conversion, key, value)
        conversion.save()
        return self.get_by_id(conversion.id)

    def delete(self, conversion: UoMConversion) -> None:
        conversion.delete()

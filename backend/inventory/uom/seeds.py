from core.seeds import BaseSeeder
from inventory.uom.services.services import UomService
from inventory.uom_conversion.services.services import UomConversionService

class UomSeeder(BaseSeeder):
    def __init__(self, uom_service: UomService = None, conv_service: UomConversionService = None):
        super().__init__()
        self.uom_service = uom_service or UomService()
        self.conv_service = conv_service or UomConversionService()

    def run(self):
        # Seed UOMs
        uoms_data = [
            {'code': 'und', 'name': 'Unidad'},
            {'code': 'doc', 'name': 'Docena'},
            {'code': 'kg', 'name': 'Kilogramo'},
            {'code': 'g', 'name': 'Gramo'},
            {'code': 'lt', 'name': 'Litro'},
            {'code': 'ml', 'name': 'Mililitro'},
        ]

        uom_objs = {}
        for data in uoms_data:
            try:
                uom = self.uom_service.create_uom(code=data['code'], name=data['name'])
                uom_objs[data['code']] = uom
                print(f"Created UOM: {data['code']}")
            except Exception:
                uom = self.uom_service.get_uom_by_code(data['code'])
                uom_objs[data['code']] = uom
                print(f"UOM {data['code']} already exists.")

        # Seed Conversions
        conversions_data = [
            {'from_code': 'kg', 'to_code': 'g', 'multiplier': 1000},
            {'from_code': 'lt', 'to_code': 'ml', 'multiplier': 1000},
            # 1 docena -> 12 unidades
            {'from_code': 'doc', 'to_code': 'und', 'multiplier': 12},
        ]

        for data in conversions_data:
            from_uom = uom_objs.get(data['from_code'])
            to_uom = uom_objs.get(data['to_code'])
            if from_uom and to_uom:
                try:
                    self.conv_service.create_conversion(
                        from_uom_id=from_uom.id,
                        to_uom_id=to_uom.id,
                        multiplier=data['multiplier']
                    )
                    print(f"Created conversion: 1 {data['from_code']} = {data['multiplier']} {data['to_code']}")
                except Exception:
                    print(f"Conversion {data['from_code']} to {data['to_code']} already exists.")

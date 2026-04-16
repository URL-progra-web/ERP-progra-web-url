from core.seeds import BaseSeeder
from inventory.business_unit.models.models import BusinessUnit


class BusinessUnitSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay business units
        if BusinessUnit.objects.exists():
            print("Business Units already seeded. Skipping...")
            return

        # Seed Business Units
        business_units_data = [
            {
                'name': 'Tienda',
                'description': 'Unidad de negocio para ventas al público'
            },
            {
                'name': 'Comercializadora',
                'description': 'Unidad de negocio para distribución y comercialización mayorista'
            },
        ]

        for data in business_units_data:
            try:
                unit = BusinessUnit.objects.create(**data)
                print(f"Created business unit: {data['name']}")
            except Exception as e:
                print(f"Business unit {data['name']} already exists or error: {e}")

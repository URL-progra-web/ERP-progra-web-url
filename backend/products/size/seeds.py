from core.seeds import BaseSeeder
from products.size.models.models import Size


class SizeSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay tallas
        if Size.objects.exists():
            print("Sizes already seeded. Skipping...")
            return

        # Seed Sizes (Tallas)
        # Solo dejamos tallas básicas y unitalla
        sizes_data = [
            {'name': 'S'},
            {'name': 'M'},
            {'name': 'L'},
            {'name': 'Unitalla'},
        ]

        for data in sizes_data:
            try:
                size = Size.objects.create(**data)
                print(f"Created size: {data['name']}")
            except Exception as e:
                print(f"Size {data['name']} already exists or error: {e}")

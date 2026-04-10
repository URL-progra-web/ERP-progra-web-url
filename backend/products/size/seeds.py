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
        sizes_data = [
            # Tallas de ropa estándar
            {'name': 'XXS'},
            {'name': 'XS'},
            {'name': 'S'},
            {'name': 'M'},
            {'name': 'L'},
            {'name': 'XL'},
            {'name': 'XXL'},
            {'name': '3XL'},
            {'name': '4XL'},
            # Tallas numéricas para calzado
            {'name': '35'},
            {'name': '36'},
            {'name': '37'},
            {'name': '38'},
            {'name': '39'},
            {'name': '40'},
            {'name': '41'},
            {'name': '42'},
            {'name': '43'},
            {'name': '44'},
            # Tallas genéricas
            {'name': 'Unitalla'},
            {'name': 'Chico'},
            {'name': 'Mediano'},
            {'name': 'Grande'},
        ]

        for data in sizes_data:
            try:
                size = Size.objects.create(**data)
                print(f"Created size: {data['name']}")
            except Exception as e:
                print(f"Size {data['name']} already exists or error: {e}")

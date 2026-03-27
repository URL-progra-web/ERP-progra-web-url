from core.seeds import BaseSeeder
from products.color.models.models import Color


class ColorSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay colores
        if Color.objects.exists():
            print("Colors already seeded. Skipping...")
            return

        # Seed Colors
        colors_data = [
            {'name': 'Rojo', 'hex_code': '#FF0000'},
            {'name': 'Azul', 'hex_code': '#0000FF'},
            {'name': 'Verde', 'hex_code': '#00FF00'},
            {'name': 'Amarillo', 'hex_code': '#FFFF00'},
            {'name': 'Negro', 'hex_code': '#000000'},
            {'name': 'Blanco', 'hex_code': '#FFFFFF'},
            {'name': 'Gris', 'hex_code': '#808080'},
            {'name': 'Rosa', 'hex_code': '#FFC0CB'},
            {'name': 'Naranja', 'hex_code': '#FFA500'},
            {'name': 'Morado', 'hex_code': '#800080'},
            {'name': 'Café', 'hex_code': '#8B4513'},
            {'name': 'Beige', 'hex_code': '#F5F5DC'},
            {'name': 'Azul Marino', 'hex_code': '#000080'},
            {'name': 'Verde Oliva', 'hex_code': '#808000'},
            {'name': 'Turquesa', 'hex_code': '#40E0D0'},
        ]

        for data in colors_data:
            try:
                color = Color.objects.create(**data)
                print(f"Created color: {data['name']}")
            except Exception as e:
                print(f"Color {data['name']} already exists or error: {e}")

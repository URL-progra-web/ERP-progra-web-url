import subprocess
from core.seeds import BaseSeeder
from products.product.models.models import Product
from products.category.models.models import Category
from crm.entrepreneur.models.models import Entrepreneur
from inventory.business_unit.models.models import BusinessUnit
from inventory.uom.models.models import UoM


class ProductSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def _download_photos(self):
        print("Downloading photos...")
        try:
            result = subprocess.run(
                ['python', '/app/products/download_photos.py'],
                capture_output=True,
                text=True,
                timeout=300
            )
            if result.returncode == 0:
                print("Photos downloaded successfully")
            else:
                print(f"Warning downloading photos: {result.stderr}")
        except Exception as e:
            print(f"Error downloading photos: {e}")

    def run(self):
        self._download_photos()

        if Product.objects.exists():
            print("Products already seeded. Skipping...")
            return

        try:
            entrepreneurs = {
                'fashion': Entrepreneur.objects.get(company_name='Fashion House S.A.'),
                'tech': Entrepreneur.objects.get(company_name='Tech Solutions Peru'),
                'sport': Entrepreneur.objects.get(company_name='Sport Center'),
                'shoes': Entrepreneur.objects.get(company_name='Calzado Premium'),
                'home': Entrepreneur.objects.get(company_name='Home & Deco'),
            }

            business_unit = BusinessUnit.objects.first()
            if not business_unit:
                print("No business units found. Please run BusinessUnitSeeder first.")
                return

            base_uom = UoM.objects.filter(code__iexact='und').first()
            if not base_uom:
                print("No base UOM found. Please run UomSeeder first.")
                return
        except Exception as e:
            print(f"Error getting dependencies: {e}")
            return

        categories = {}
        try:
            categories = {
                'camisetas': Category.objects.get(name='Camisetas', is_leaf=True),
                'pantalones': Category.objects.get(name='Pantalones', is_leaf=True),
                'shorts': Category.objects.get(name='Shorts', is_leaf=True),
                'zapatillas': Category.objects.get(name='Zapatillas', is_leaf=True),
                'sandalias': Category.objects.get(name='Sandalias', is_leaf=True),
                'smartphones': Category.objects.get(name='Smartphones', is_leaf=True),
                'laptops': Category.objects.get(name='Laptops', is_leaf=True),
                'tablets': Category.objects.get(name='Tablets', is_leaf=True),
                'audifonos': Category.objects.get(name='Audífonos', is_leaf=True),
                'bolsos': Category.objects.get(name='Bolsos', is_leaf=True),
                'gafas': Category.objects.get(name='Gafas', is_leaf=True),
                'textiles': Category.objects.get(name='Textiles', is_leaf=True),
            }
        except Category.DoesNotExist as e:
            print(f"Some categories not found: {e}")
            return

        products_data = [
            {'name': 'Camiseta Básica Algodón', 'description': 'Camiseta 100% algodón, ideal para uso diario', 'category': categories['camisetas'], 'entrepreneur': entrepreneurs['fashion'], 'image': 'products/01_camiseta.jpg'},
            {'name': 'Camiseta Dry-Fit Sport', 'description': 'Camiseta deportiva que absorbe la humedad', 'category': categories['camisetas'], 'entrepreneur': entrepreneurs['sport'], 'image': 'products/02_camiseta_dryfit.jpg'},
            {'name': 'Camiseta Oversized', 'description': 'Camiseta oversize estilo urbano', 'category': categories['camisetas'], 'entrepreneur': entrepreneurs['fashion'], 'image': 'products/03_camiseta_oversized.jpg'},
            {'name': 'Jeans Classic Fit', 'description': 'Jean corte clásico recto', 'category': categories['pantalones'], 'entrepreneur': entrepreneurs['fashion'], 'image': 'products/04_jeans.jpg'},
            {'name': 'Pantalón Deportivo', 'description': 'Pantalón deportivo cómodo para entrenar', 'category': categories['pantalones'], 'entrepreneur': entrepreneurs['sport'], 'image': 'products/05_pantalon_deportivo.jpg'},
            {'name': 'Shorts Casual Playa', 'description': 'Shorts casuales para playa y piscina', 'category': categories['shorts'], 'entrepreneur': entrepreneurs['fashion'], 'image': 'products/06_shorts.jpg'},
            {'name': 'Zapatillas Running Pro', 'description': 'Zapatillas profesionales para correr', 'category': categories['zapatillas'], 'entrepreneur': entrepreneurs['sport'], 'image': 'products/07_zapatillas_running.jpg'},
            {'name': 'Zapatillas Urban Casual', 'description': 'Zapatillas casuales estilo urbano', 'category': categories['zapatillas'], 'entrepreneur': entrepreneurs['shoes'], 'image': 'products/08_zapatillas_urban.jpg'},
            {'name': 'Sandalias Premium Leather', 'description': 'Sandalias de cuero premium', 'category': categories['sandalias'], 'entrepreneur': entrepreneurs['shoes'], 'image': 'products/09_sandalias.jpg'},
            {'name': 'Smartphone Galaxy X10', 'description': 'Smartphone 128GB AMOLED', 'category': categories['smartphones'], 'entrepreneur': entrepreneurs['tech'], 'image': 'products/10_smartphone.jpg'},
            {'name': 'iPhone 15 Pro Max', 'description': 'iPhone 256GB última generación', 'category': categories['smartphones'], 'entrepreneur': entrepreneurs['tech'], 'image': 'products/11_iphone.jpg'},
            {'name': 'Laptop Business Elite', 'description': 'Laptop Intel i7, 16GB RAM', 'category': categories['laptops'], 'entrepreneur': entrepreneurs['tech'], 'image': 'products/12_laptop.jpg'},
            {'name': 'Tablet Pro 11"', 'description': 'Tablet 11" WiFi 128GB', 'category': categories['tablets'], 'entrepreneur': entrepreneurs['tech'], 'image': 'products/13_tablet.jpg'},
            {'name': 'Audífonos Wireless Pro', 'description': 'Audífonos bluetooth cancelación ruido', 'category': categories['audifonos'], 'entrepreneur': entrepreneurs['tech'], 'image': 'products/14_audifonos.jpg'},
            {'name': 'Bolso Tote Cuero', 'description': 'Bolso tote de cuero genuino', 'category': categories['bolsos'], 'entrepreneur': entrepreneurs['home'], 'image': 'products/15_bolso_tote.jpg'},
            {'name': 'Mochila Urbana AntiRobo', 'description': 'Mochila con sistema antirrobo', 'category': categories['bolsos'], 'entrepreneur': entrepreneurs['home'], 'image': 'products/16_mochila.jpg'},
            {'name': 'Reloj Smart Serie 9', 'description': 'Smartwatch con monitor de salud', 'category': categories['gafas'], 'entrepreneur': entrepreneurs['tech'], 'image': 'products/17_reloj.jpg'},
            {'name': 'Gafas Sol Vintage', 'description': 'Gafas de sol estilo vintage', 'category': categories['gafas'], 'entrepreneur': entrepreneurs['home'], 'image': 'products/18_gafas.jpg'},
            {'name': 'Billetera Cuero Premium', 'description': 'Billetera de cuero genuino', 'category': categories['bolsos'], 'entrepreneur': entrepreneurs['home'], 'image': 'products/19_billetera.jpg'},
            {'name': 'Sábanas 200 Hilos', 'description': 'Juego de sábanas 200 hilos algodon', 'category': categories['textiles'], 'entrepreneur': entrepreneurs['home'], 'image': 'products/20_sabanas.jpg'},
        ]

        for data in products_data:
            try:
                entrepreneur = data.pop('entrepreneur')
                product = Product.objects.create(
                    **data,
                    entrepreneur=entrepreneur,
                    business_unit=business_unit,
                    base_uom=base_uom,
                )
                print(f"Created product: {data['name']}")
            except Exception as e:
                print(f"Product {data['name']} error: {e}")
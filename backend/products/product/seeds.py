from core.seeds import BaseSeeder
from products.product.models.models import Product
from products.category.models.models import Category
from crm.entrepreneur.models.models import Entrepreneur
from inventory.business_unit.models.models import BusinessUnit
from inventory.uom.models.models import UoM


class ProductSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay productos del seeder
        if Product.objects.filter(name='Camiseta Básica Algodón').exists():
            print("Products already seeded. Skipping...")
            return

        # Obtener referencias necesarias
        try:
            # Obtener entrepreneurs por nombre para distribución realista
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
        except Entrepreneur.DoesNotExist as e:
            print(f"Some entrepreneurs not found. Please run EntrepreneurSeeder first: {e}")
            return
        except Exception as e:
            print(f"Error getting dependencies: {e}")
            return

        # Obtener categorías leaf (para asignar productos)
        categories = {}
        try:
            categories['camisetas'] = Category.objects.get(name='Camisetas', is_leaf=True)
            categories['pantalones'] = Category.objects.get(name='Pantalones', is_leaf=True)
            categories['zapatillas'] = Category.objects.get(name='Zapatillas', is_leaf=True)
            categories['smartphones'] = Category.objects.get(name='Smartphones', is_leaf=True)
            categories['laptops'] = Category.objects.get(name='Laptops', is_leaf=True)
            categories['bolsos'] = Category.objects.get(name='Bolsos', is_leaf=True)
        except Category.DoesNotExist as e:
            print(f"Some categories not found. Please run CategorySeeder first: {e}")
            return

        # Seed Products - Distribuidos por empresa según especialidad
        products_data = [
            # Ropa - Fashion House S.A.
            {
                'name': 'Camiseta Básica Algodón',
                'description': 'Camiseta 100% algodón, ideal para uso diario',
                'category': categories.get('camisetas'),
                'entrepreneur': entrepreneurs['fashion'],
            },
            {
                'name': 'Pantalón Jean Clásico',
                'description': 'Pantalón jean de corte clásico, disponible en varios colores',
                'category': categories.get('pantalones'),
                'entrepreneur': entrepreneurs['fashion'],
            },
            # Ropa Deportiva - Sport Center
            {
                'name': 'Camiseta Deportiva Dry-Fit',
                'description': 'Camiseta deportiva con tecnología que absorbe la humedad',
                'category': categories.get('camisetas'),
                'entrepreneur': entrepreneurs['sport'],
            },
            {
                'name': 'Pantalón Deportivo',
                'description': 'Pantalón deportivo cómodo para entrenar',
                'category': categories.get('pantalones'),
                'entrepreneur': entrepreneurs['sport'],
            },
            # Calzado Deportivo - Sport Center
            {
                'name': 'Zapatillas Running Pro',
                'description': 'Zapatillas profesionales para correr con amortiguación avanzada',
                'category': categories.get('zapatillas'),
                'entrepreneur': entrepreneurs['sport'],
            },
            # Calzado Casual - Calzado Premium
            {
                'name': 'Zapatillas Casual Urban',
                'description': 'Zapatillas casuales para uso diario',
                'category': categories.get('zapatillas'),
                'entrepreneur': entrepreneurs['shoes'],
            },
            # Electrónica - Tech Solutions Peru
            {
                'name': 'Smartphone Galaxy X10',
                'description': 'Smartphone con pantalla AMOLED 6.5", 128GB almacenamiento',
                'category': categories.get('smartphones'),
                'entrepreneur': entrepreneurs['tech'],
            },
            {
                'name': 'Smartphone iPhone Pro',
                'description': 'iPhone última generación, 256GB, cámara triple',
                'category': categories.get('smartphones'),
                'entrepreneur': entrepreneurs['tech'],
            },
            {
                'name': 'Laptop Business Elite',
                'description': 'Laptop profesional Intel i7, 16GB RAM, 512GB SSD',
                'category': categories.get('laptops'),
                'entrepreneur': entrepreneurs['tech'],
            },
            {
                'name': 'Laptop Gaming Master',
                'description': 'Laptop para gaming con RTX 4060, 32GB RAM, 1TB SSD',
                'category': categories.get('laptops'),
                'entrepreneur': entrepreneurs['tech'],
            },
            # Accesorios - Home & Deco
            {
                'name': 'Bolso Tote Cuero',
                'description': 'Bolso tipo tote de cuero genuino',
                'category': categories.get('bolsos'),
                'entrepreneur': entrepreneurs['home'],
            },
            {
                'name': 'Mochila Urban Style',
                'description': 'Mochila moderna con compartimento para laptop',
                'category': categories.get('bolsos'),
                'entrepreneur': entrepreneurs['home'],
            },
        ]

        for data in products_data:
            try:
                entrepreneur = data.pop('entrepreneur')
                product = Product.objects.create(
                    name=data['name'],
                    description=data['description'],
                    category=data['category'],
                    entrepreneur=entrepreneur,
                    business_unit=business_unit,
                    base_uom=base_uom,
                )
                print(f"Created product: {data['name']} (Entrepreneur: {entrepreneur.company_name})")
            except Exception as e:
                print(f"Product {data['name']} already exists or error: {e}")

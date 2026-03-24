from core.seeds import BaseSeeder
from products.product.models.models import Product
from products.category.models.models import Category
from crm.entrepreneur.models.models import Entrepreneur
from inventory.business_unit.models.models import BusinessUnit


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
            entrepreneur = Entrepreneur.objects.first()
            if not entrepreneur:
                print("No entrepreneurs found. Please run EntrepreneurSeeder first.")
                return

            business_unit = BusinessUnit.objects.first()
            if not business_unit:
                print("No business units found. Please run BusinessUnitSeeder first.")
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

        # Seed Products
        products_data = [
            # Ropa
            {
                'name': 'Camiseta Básica Algodón',
                'description': 'Camiseta 100% algodón, ideal para uso diario',
                'category': categories.get('camisetas'),
            },
            {
                'name': 'Camiseta Deportiva Dry-Fit',
                'description': 'Camiseta deportiva con tecnología que absorbe la humedad',
                'category': categories.get('camisetas'),
            },
            {
                'name': 'Pantalón Jean Clásico',
                'description': 'Pantalón jean de corte clásico, disponible en varios colores',
                'category': categories.get('pantalones'),
            },
            {
                'name': 'Pantalón Deportivo',
                'description': 'Pantalón deportivo cómodo para entrenar',
                'category': categories.get('pantalones'),
            },
            # Calzado
            {
                'name': 'Zapatillas Running Pro',
                'description': 'Zapatillas profesionales para correr con amortiguación avanzada',
                'category': categories.get('zapatillas'),
            },
            {
                'name': 'Zapatillas Casual Urban',
                'description': 'Zapatillas casuales para uso diario',
                'category': categories.get('zapatillas'),
            },
            # Electrónica
            {
                'name': 'Smartphone Galaxy X10',
                'description': 'Smartphone con pantalla AMOLED 6.5", 128GB almacenamiento',
                'category': categories.get('smartphones'),
            },
            {
                'name': 'Smartphone iPhone Pro',
                'description': 'iPhone última generación, 256GB, cámara triple',
                'category': categories.get('smartphones'),
            },
            {
                'name': 'Laptop Business Elite',
                'description': 'Laptop profesional Intel i7, 16GB RAM, 512GB SSD',
                'category': categories.get('laptops'),
            },
            {
                'name': 'Laptop Gaming Master',
                'description': 'Laptop para gaming con RTX 4060, 32GB RAM, 1TB SSD',
                'category': categories.get('laptops'),
            },
            # Accesorios
            {
                'name': 'Bolso Tote Cuero',
                'description': 'Bolso tipo tote de cuero genuino',
                'category': categories.get('bolsos'),
            },
            {
                'name': 'Mochila Urban Style',
                'description': 'Mochila moderna con compartimento para laptop',
                'category': categories.get('bolsos'),
            },
        ]

        for data in products_data:
            try:
                product = Product.objects.create(
                    name=data['name'],
                    description=data['description'],
                    category=data['category'],
                    entrepreneur=entrepreneur,
                    business_unit=business_unit
                )
                print(f"Created product: {data['name']}")
            except Exception as e:
                print(f"Product {data['name']} already exists or error: {e}")

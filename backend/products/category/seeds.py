from core.seeds import BaseSeeder
from products.category.models.models import Category


class CategorySeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay categorías
        if Category.objects.exists():
            print("Categories already seeded. Skipping...")
            return

        # Seed Categories con estructura jerárquica
        categories_data = [
            # Categorías principales (nivel 1)
            {'name': 'Ropa', 'parent': None, 'is_leaf': False},
            {'name': 'Calzado', 'parent': None, 'is_leaf': False},
            {'name': 'Accesorios', 'parent': None, 'is_leaf': False},
            {'name': 'Electrónica', 'parent': None, 'is_leaf': False},
            {'name': 'Hogar', 'parent': None, 'is_leaf': False},
            {'name': 'Deportes', 'parent': None, 'is_leaf': False},
        ]

        # Crear categorías principales
        created_categories = {}
        for data in categories_data:
            try:
                category = Category.objects.create(**data)
                created_categories[data['name']] = category
                print(f"Created category: {data['name']}")
            except Exception as e:
                try:
                    category = Category.objects.get(name=data['name'], parent=None)
                    created_categories[data['name']] = category
                    print(f"Category {data['name']} already exists")
                except:
                    print(f"Error with category {data['name']}: {e}")

        # Subcategorías de Ropa
        if 'Ropa' in created_categories:
            ropa_subs = [
                {'name': 'Camisetas', 'is_leaf': True},
                {'name': 'Pantalones', 'is_leaf': True},
                {'name': 'Vestidos', 'is_leaf': True},
                {'name': 'Chaquetas', 'is_leaf': True},
                {'name': 'Sudaderas', 'is_leaf': True},
                {'name': 'Shorts', 'is_leaf': True},
            ]
            for sub in ropa_subs:
                try:
                    Category.objects.create(
                        name=sub['name'],
                        parent=created_categories['Ropa'],
                        is_leaf=sub['is_leaf']
                    )
                    print(f"Created subcategory: Ropa > {sub['name']}")
                except Exception as e:
                    print(f"Subcategory {sub['name']} already exists or error: {e}")

        # Subcategorías de Calzado
        if 'Calzado' in created_categories:
            calzado_subs = [
                {'name': 'Zapatillas', 'is_leaf': True},
                {'name': 'Botas', 'is_leaf': True},
                {'name': 'Sandalias', 'is_leaf': True},
                {'name': 'Zapatos formales', 'is_leaf': True},
                {'name': 'Deportivo', 'is_leaf': True},
            ]
            for sub in calzado_subs:
                try:
                    Category.objects.create(
                        name=sub['name'],
                        parent=created_categories['Calzado'],
                        is_leaf=sub['is_leaf']
                    )
                    print(f"Created subcategory: Calzado > {sub['name']}")
                except Exception as e:
                    print(f"Subcategory {sub['name']} already exists or error: {e}")

        # Subcategorías de Accesorios
        if 'Accesorios' in created_categories:
            acc_subs = [
                {'name': 'Bolsos', 'is_leaf': True},
                {'name': 'Gorras', 'is_leaf': True},
                {'name': 'Cinturones', 'is_leaf': True},
                {'name': 'Joyería', 'is_leaf': True},
                {'name': 'Gafas', 'is_leaf': True},
            ]
            for sub in acc_subs:
                try:
                    Category.objects.create(
                        name=sub['name'],
                        parent=created_categories['Accesorios'],
                        is_leaf=sub['is_leaf']
                    )
                    print(f"Created subcategory: Accesorios > {sub['name']}")
                except Exception as e:
                    print(f"Subcategory {sub['name']} already exists or error: {e}")

        # Subcategorías de Electrónica
        if 'Electrónica' in created_categories:
            elec_subs = [
                {'name': 'Smartphones', 'is_leaf': True},
                {'name': 'Laptops', 'is_leaf': True},
                {'name': 'Tablets', 'is_leaf': True},
                {'name': 'Audífonos', 'is_leaf': True},
                {'name': 'Cámaras', 'is_leaf': True},
            ]
            for sub in elec_subs:
                try:
                    Category.objects.create(
                        name=sub['name'],
                        parent=created_categories['Electrónica'],
                        is_leaf=sub['is_leaf']
                    )
                    print(f"Created subcategory: Electrónica > {sub['name']}")
                except Exception as e:
                    print(f"Subcategory {sub['name']} already exists or error: {e}")

        # Subcategorías de Hogar
        if 'Hogar' in created_categories:
            hogar_subs = [
                {'name': 'Muebles', 'is_leaf': True},
                {'name': 'Decoración', 'is_leaf': True},
                {'name': 'Cocina', 'is_leaf': True},
                {'name': 'Textiles', 'is_leaf': True},
            ]
            for sub in hogar_subs:
                try:
                    Category.objects.create(
                        name=sub['name'],
                        parent=created_categories['Hogar'],
                        is_leaf=sub['is_leaf']
                    )
                    print(f"Created subcategory: Hogar > {sub['name']}")
                except Exception as e:
                    print(f"Subcategory {sub['name']} already exists or error: {e}")

        # Subcategorías de Deportes
        if 'Deportes' in created_categories:
            dep_subs = [
                {'name': 'Equipamiento', 'is_leaf': True},
                {'name': 'Ropa deportiva', 'is_leaf': True},
                {'name': 'Suplementos', 'is_leaf': True},
            ]
            for sub in dep_subs:
                try:
                    Category.objects.create(
                        name=sub['name'],
                        parent=created_categories['Deportes'],
                        is_leaf=sub['is_leaf']
                    )
                    print(f"Created subcategory: Deportes > {sub['name']}")
                except Exception as e:
                    print(f"Subcategory {sub['name']} already exists or error: {e}")

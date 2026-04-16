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

        # Solo 2 raíces: Ropa y Accesorios
        # El resto cuelga de estas raíces para formar mayor jerarquía.
        hierarchy = {
            'Ropa': {
                'is_leaf': False,
                'children': {
                    'Casual': {
                        'is_leaf': False,
                        'children': {
                            'Camisetas': {'is_leaf': True, 'children': {}},
                            'Pantalones': {'is_leaf': True, 'children': {}},
                            'Vestidos': {'is_leaf': True, 'children': {}},
                            'Chaquetas': {'is_leaf': True, 'children': {}},
                            'Sudaderas': {'is_leaf': True, 'children': {}},
                            'Shorts': {'is_leaf': True, 'children': {}},
                        },
                    },
                    'Calzado': {
                        'is_leaf': False,
                        'children': {
                            'Zapatillas': {'is_leaf': True, 'children': {}},
                            'Botas': {'is_leaf': True, 'children': {}},
                            'Sandalias': {'is_leaf': True, 'children': {}},
                            'Zapatos formales': {'is_leaf': True, 'children': {}},
                            'Deportivo': {'is_leaf': True, 'children': {}},
                        },
                    },
                    'Deportes': {
                        'is_leaf': False,
                        'children': {
                            'Ropa deportiva': {'is_leaf': True, 'children': {}},
                            'Equipamiento': {'is_leaf': True, 'children': {}},
                            'Suplementos': {'is_leaf': True, 'children': {}},
                        },
                    },
                },
            },
            'Accesorios': {
                'is_leaf': False,
                'children': {
                    'Moda': {
                        'is_leaf': False,
                        'children': {
                            'Bolsos': {'is_leaf': True, 'children': {}},
                            'Gorras': {'is_leaf': True, 'children': {}},
                            'Cinturones': {'is_leaf': True, 'children': {}},
                            'Joyería': {'is_leaf': True, 'children': {}},
                            'Gafas': {'is_leaf': True, 'children': {}},
                        },
                    },
                    'Electrónica': {
                        'is_leaf': False,
                        'children': {
                            'Smartphones': {'is_leaf': True, 'children': {}},
                            'Laptops': {'is_leaf': True, 'children': {}},
                            'Tablets': {'is_leaf': True, 'children': {}},
                            'Audífonos': {'is_leaf': True, 'children': {}},
                            'Cámaras': {'is_leaf': True, 'children': {}},
                        },
                    },
                    'Hogar': {
                        'is_leaf': False,
                        'children': {
                            'Muebles': {'is_leaf': True, 'children': {}},
                            'Decoración': {'is_leaf': True, 'children': {}},
                            'Cocina': {'is_leaf': True, 'children': {}},
                            'Textiles': {'is_leaf': True, 'children': {}},
                        },
                    },
                },
            },
        }

        def create_node(name, node_data, parent=None, ancestry=''):
            category, created = Category.objects.get_or_create(
                name=name,
                parent=parent,
                defaults={'is_leaf': node_data['is_leaf']},
            )

            if not created and category.is_leaf != node_data['is_leaf']:
                category.is_leaf = node_data['is_leaf']
                category.save(update_fields=['is_leaf'])

            current_path = f"{ancestry} > {name}" if ancestry else name
            action = 'Created' if created else 'Found'
            print(f"{action} category: {current_path}")

            for child_name, child_data in node_data.get('children', {}).items():
                create_node(child_name, child_data, parent=category, ancestry=current_path)

        for root_name, root_data in hierarchy.items():
            create_node(root_name, root_data)

from decimal import Decimal

from core.seeds import BaseSeeder
from inventory.transaction.services.services import InventoryTransactionService
from products.color.models.models import Color
from products.product.models.models import Product
from products.size.models.models import Size
from products.variant.models.models import ProductVariant


class ProductVariantSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()
        self.inventory_transaction_service = InventoryTransactionService()

    def run(self):
        if ProductVariant.objects.filter(sku='CAM-BAS-BLA-S').exists():
            print('Product Variants already seeded. Skipping...')
            return

        products = self._get_products()
        sizes = self._get_sizes()
        colors = self._get_colors()
        if not products or not sizes or not colors:
            return

        variants_data = [
            {'product': products['camiseta_basica'], 'sku': 'CAM-BAS-BLA-S', 'size': sizes['S'], 'color': colors['Blanco'], 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'initial_stock': Decimal('50')},
            {'product': products['camiseta_basica'], 'sku': 'CAM-BAS-BLA-M', 'size': sizes['M'], 'color': colors['Blanco'], 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'initial_stock': Decimal('75')},
            {'product': products['camiseta_basica'], 'sku': 'CAM-BAS-NEG-M', 'size': sizes['M'], 'color': colors['Negro'], 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'initial_stock': Decimal('60')},
            {'product': products['camiseta_basica'], 'sku': 'CAM-BAS-NEG-L', 'size': sizes['L'], 'color': colors['Negro'], 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'initial_stock': Decimal('45')},
            {'product': products['camiseta_deportiva'], 'sku': 'CAM-DEP-AZU-M', 'size': sizes['M'], 'color': colors['Azul'], 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'initial_stock': Decimal('40')},
            {'product': products['camiseta_deportiva'], 'sku': 'CAM-DEP-AZU-L', 'size': sizes['L'], 'color': colors['Azul'], 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'initial_stock': Decimal('35')},
            {'product': products['camiseta_deportiva'], 'sku': 'CAM-DEP-ROJ-M', 'size': sizes['M'], 'color': colors['Rojo'], 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'initial_stock': Decimal('30')},
            {'product': products['pantalon_jean'], 'sku': 'PAN-JEA-AZU-M', 'size': sizes['M'], 'color': colors['Azul'], 'cost': Decimal('40.00'), 'price': Decimal('79.90'), 'initial_stock': Decimal('25')},
            {'product': products['pantalon_jean'], 'sku': 'PAN-JEA-AZU-L', 'size': sizes['L'], 'color': colors['Azul'], 'cost': Decimal('40.00'), 'price': Decimal('79.90'), 'initial_stock': Decimal('30')},
            {'product': products['pantalon_jean'], 'sku': 'PAN-JEA-NEG-L', 'size': sizes['L'], 'color': colors['Negro'], 'cost': Decimal('40.00'), 'price': Decimal('79.90'), 'initial_stock': Decimal('20')},
            {'product': products['zapatillas_running'], 'sku': 'ZAP-RUN-BLA-40', 'size': sizes['40'], 'color': colors['Blanco'], 'cost': Decimal('80.00'), 'price': Decimal('159.90'), 'initial_stock': Decimal('15')},
            {'product': products['zapatillas_running'], 'sku': 'ZAP-RUN-BLA-41', 'size': sizes['41'], 'color': colors['Blanco'], 'cost': Decimal('80.00'), 'price': Decimal('159.90'), 'initial_stock': Decimal('18')},
            {'product': products['zapatillas_running'], 'sku': 'ZAP-RUN-NEG-42', 'size': sizes['42'], 'color': colors['Negro'], 'cost': Decimal('80.00'), 'price': Decimal('159.90'), 'initial_stock': Decimal('12')},
            {'product': products['smartphone_galaxy'], 'sku': 'SMART-GAL-NEG', 'size': None, 'color': colors['Negro'], 'cost': Decimal('500.00'), 'price': Decimal('899.00'), 'initial_stock': Decimal('10')},
            {'product': products['smartphone_galaxy'], 'sku': 'SMART-GAL-BLA', 'size': None, 'color': colors['Blanco'], 'cost': Decimal('500.00'), 'price': Decimal('899.00'), 'initial_stock': Decimal('8')},
            {'product': products['laptop_business'], 'sku': 'LAP-BUS-GRI', 'size': None, 'color': colors['Gris'], 'cost': Decimal('1200.00'), 'price': Decimal('1899.00'), 'initial_stock': Decimal('5')},
        ]

        for data in variants_data:
            initial_stock = data.pop('initial_stock')
            try:
                variant = ProductVariant.objects.create(**data)
                self.inventory_transaction_service.create_transaction(
                    variant_id=variant.id,
                    transaction_type_name='Entrada',
                    quantity=initial_stock,
                    selected_uom_id=variant.product.base_uom_id,
                    reference=f'SEED-{variant.sku}',
                    notes='Carga inicial por seeder',
                )
                print(f"Created variant: {variant.sku} with stock {initial_stock}")
            except Exception as e:
                print(f"Variant {data['sku']} already exists or error: {e}")

    @staticmethod
    def _get_products():
        try:
            return {
                'camiseta_basica': Product.objects.get(name='Camiseta Básica Algodón'),
                'camiseta_deportiva': Product.objects.get(name='Camiseta Deportiva Dry-Fit'),
                'pantalon_jean': Product.objects.get(name='Pantalón Jean Clásico'),
                'zapatillas_running': Product.objects.get(name='Zapatillas Running Pro'),
                'smartphone_galaxy': Product.objects.get(name='Smartphone Galaxy X10'),
                'laptop_business': Product.objects.get(name='Laptop Business Elite'),
            }
        except Product.DoesNotExist as e:
            print(f'Some products not found. Please run ProductSeeder first: {e}')
            return None

    @staticmethod
    def _get_sizes():
        try:
            return {
                'S': Size.objects.get(name='S'),
                'M': Size.objects.get(name='M'),
                'L': Size.objects.get(name='L'),
                'XL': Size.objects.get(name='XL'),
                '40': Size.objects.get(name='40'),
                '41': Size.objects.get(name='41'),
                '42': Size.objects.get(name='42'),
            }
        except Size.DoesNotExist as e:
            print(f'Some sizes not found. Please run SizeSeeder first: {e}')
            return None

    @staticmethod
    def _get_colors():
        try:
            return {
                'Negro': Color.objects.get(name='Negro'),
                'Blanco': Color.objects.get(name='Blanco'),
                'Azul': Color.objects.get(name='Azul'),
                'Rojo': Color.objects.get(name='Rojo'),
                'Gris': Color.objects.get(name='Gris'),
            }
        except Color.DoesNotExist as e:
            print(f'Some colors not found. Please run ColorSeeder first: {e}')
            return None

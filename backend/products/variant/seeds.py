from core.seeds import BaseSeeder
from products.variant.models.models import ProductVariant
from products.product.models.models import Product
from products.size.models.models import Size
from products.color.models.models import Color
from inventory.uom.models.models import UoM
from decimal import Decimal


class ProductVariantSeeder(BaseSeeder):
    def __init__(self):
        super().__init__()

    def run(self):
        # Verificar si ya hay variantes del seeder
        if ProductVariant.objects.filter(sku='CAM-BAS-BLA-S').exists():
            print("Product Variants already seeded. Skipping...")
            return

        # Obtener referencias necesarias
        try:
            # UoMs
            uom_unidad = UoM.objects.get(code='und')
        except UoM.DoesNotExist:
            try:
                # Intentar con mayúscula
                uom_unidad = UoM.objects.filter(code__iexact='und').first()
                if not uom_unidad:
                    # Crear si no existe
                    uom_unidad = UoM.objects.create(code='und', name='Unidad')
                    print("Created UoM: Unidad")
            except Exception as e:
                print(f"Error with UoM: {e}")
                return

        # Obtener productos
        products = {}
        try:
            products['camiseta_basica'] = Product.objects.get(name='Camiseta Básica Algodón')
            products['camiseta_deportiva'] = Product.objects.get(name='Camiseta Deportiva Dry-Fit')
            products['pantalon_jean'] = Product.objects.get(name='Pantalón Jean Clásico')
            products['zapatillas_running'] = Product.objects.get(name='Zapatillas Running Pro')
            products['smartphone_galaxy'] = Product.objects.get(name='Smartphone Galaxy X10')
            products['laptop_business'] = Product.objects.get(name='Laptop Business Elite')
        except Product.DoesNotExist as e:
            print(f"Some products not found. Please run ProductSeeder first: {e}")
            return

        # Obtener tallas
        sizes = {}
        try:
            sizes['S'] = Size.objects.get(name='S')
            sizes['M'] = Size.objects.get(name='M')
            sizes['L'] = Size.objects.get(name='L')
            sizes['XL'] = Size.objects.get(name='XL')
            sizes['40'] = Size.objects.get(name='40')
            sizes['41'] = Size.objects.get(name='41')
            sizes['42'] = Size.objects.get(name='42')
        except Size.DoesNotExist as e:
            print(f"Some sizes not found. Please run SizeSeeder first: {e}")
            return

        # Obtener colores
        colors = {}
        try:
            colors['Negro'] = Color.objects.get(name='Negro')
            colors['Blanco'] = Color.objects.get(name='Blanco')
            colors['Azul'] = Color.objects.get(name='Azul')
            colors['Rojo'] = Color.objects.get(name='Rojo')
            colors['Gris'] = Color.objects.get(name='Gris')
        except Color.DoesNotExist as e:
            print(f"Some colors not found. Please run ColorSeeder first: {e}")
            return

        # Seed Product Variants
        variants_data = [
            # Variantes de Camiseta Básica
            {
                'product': products['camiseta_basica'],
                'sku': 'CAM-BAS-BLA-S',
                'size': sizes['S'],
                'color': colors['Blanco'],
                'uom': uom_unidad,
                'cost': Decimal('15.00'),
                'price': Decimal('29.90'),
                'quantity_available': 50,
            },
            {
                'product': products['camiseta_basica'],
                'sku': 'CAM-BAS-BLA-M',
                'size': sizes['M'],
                'color': colors['Blanco'],
                'uom': uom_unidad,
                'cost': Decimal('15.00'),
                'price': Decimal('29.90'),
                'quantity_available': 75,
            },
            {
                'product': products['camiseta_basica'],
                'sku': 'CAM-BAS-NEG-M',
                'size': sizes['M'],
                'color': colors['Negro'],
                'uom': uom_unidad,
                'cost': Decimal('15.00'),
                'price': Decimal('29.90'),
                'quantity_available': 60,
            },
            {
                'product': products['camiseta_basica'],
                'sku': 'CAM-BAS-NEG-L',
                'size': sizes['L'],
                'color': colors['Negro'],
                'uom': uom_unidad,
                'cost': Decimal('15.00'),
                'price': Decimal('29.90'),
                'quantity_available': 45,
            },
            # Variantes de Camiseta Deportiva
            {
                'product': products['camiseta_deportiva'],
                'sku': 'CAM-DEP-AZU-M',
                'size': sizes['M'],
                'color': colors['Azul'],
                'uom': uom_unidad,
                'cost': Decimal('25.00'),
                'price': Decimal('49.90'),
                'quantity_available': 40,
            },
            {
                'product': products['camiseta_deportiva'],
                'sku': 'CAM-DEP-AZU-L',
                'size': sizes['L'],
                'color': colors['Azul'],
                'uom': uom_unidad,
                'cost': Decimal('25.00'),
                'price': Decimal('49.90'),
                'quantity_available': 35,
            },
            {
                'product': products['camiseta_deportiva'],
                'sku': 'CAM-DEP-ROJ-M',
                'size': sizes['M'],
                'color': colors['Rojo'],
                'uom': uom_unidad,
                'cost': Decimal('25.00'),
                'price': Decimal('49.90'),
                'quantity_available': 30,
            },
            # Variantes de Pantalón Jean
            {
                'product': products['pantalon_jean'],
                'sku': 'PAN-JEA-AZU-M',
                'size': sizes['M'],
                'color': colors['Azul'],
                'uom': uom_unidad,
                'cost': Decimal('40.00'),
                'price': Decimal('79.90'),
                'quantity_available': 25,
            },
            {
                'product': products['pantalon_jean'],
                'sku': 'PAN-JEA-AZU-L',
                'size': sizes['L'],
                'color': colors['Azul'],
                'uom': uom_unidad,
                'cost': Decimal('40.00'),
                'price': Decimal('79.90'),
                'quantity_available': 30,
            },
            {
                'product': products['pantalon_jean'],
                'sku': 'PAN-JEA-NEG-L',
                'size': sizes['L'],
                'color': colors['Negro'],
                'uom': uom_unidad,
                'cost': Decimal('40.00'),
                'price': Decimal('79.90'),
                'quantity_available': 20,
            },
            # Variantes de Zapatillas
            {
                'product': products['zapatillas_running'],
                'sku': 'ZAP-RUN-BLA-40',
                'size': sizes['40'],
                'color': colors['Blanco'],
                'uom': uom_unidad,
                'cost': Decimal('80.00'),
                'price': Decimal('159.90'),
                'quantity_available': 15,
            },
            {
                'product': products['zapatillas_running'],
                'sku': 'ZAP-RUN-BLA-41',
                'size': sizes['41'],
                'color': colors['Blanco'],
                'uom': uom_unidad,
                'cost': Decimal('80.00'),
                'price': Decimal('159.90'),
                'quantity_available': 18,
            },
            {
                'product': products['zapatillas_running'],
                'sku': 'ZAP-RUN-NEG-42',
                'size': sizes['42'],
                'color': colors['Negro'],
                'uom': uom_unidad,
                'cost': Decimal('80.00'),
                'price': Decimal('159.90'),
                'quantity_available': 12,
            },
            # Variantes de Smartphone (sin talla, solo color)
            {
                'product': products['smartphone_galaxy'],
                'sku': 'SMART-GAL-NEG',
                'size': None,
                'color': colors['Negro'],
                'uom': uom_unidad,
                'cost': Decimal('500.00'),
                'price': Decimal('899.00'),
                'quantity_available': 10,
            },
            {
                'product': products['smartphone_galaxy'],
                'sku': 'SMART-GAL-BLA',
                'size': None,
                'color': colors['Blanco'],
                'uom': uom_unidad,
                'cost': Decimal('500.00'),
                'price': Decimal('899.00'),
                'quantity_available': 8,
            },
            # Variantes de Laptop (sin talla ni color)
            {
                'product': products['laptop_business'],
                'sku': 'LAP-BUS-GRI',
                'size': None,
                'color': colors['Gris'],
                'uom': uom_unidad,
                'cost': Decimal('1200.00'),
                'price': Decimal('1899.00'),
                'quantity_available': 5,
            },
        ]

        for data in variants_data:
            try:
                variant = ProductVariant.objects.create(**data)
                print(f"Created variant: {data['sku']}")
            except Exception as e:
                print(f"Variant {data['sku']} already exists or error: {e}")

from decimal import Decimal
import random

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
        if ProductVariant.objects.exists():
            print('Product Variants already seeded. Skipping...')
            return

        products = Product.objects.all()
        if not products:
            print('No products found. Run ProductSeeder first.')
            return

        sizes = self._get_sizes()
        colors = self._get_colors()
        if not sizes or not colors:
            return

        variants_data = []

        # Usamos solo tallas S, M, L y Unitalla
        size_s = sizes.get('S')
        size_m = sizes.get('M')
        size_l = sizes.get('L')
        size_unitalla = sizes.get('Unitalla')
        color_list = list(colors.values())
        color_negro = colors['Negro']
        color_blanco = colors['Blanco']
        color_azul = colors['Azul']
        color_rojo = colors['Rojo']
        color_gris = colors['Gris']

        var_image_blanca = 'product_variants/var_camiseta_blanca.jpg'
        var_image_negra = 'product_variants/var_camiseta_negra.jpg'
        var_image_azul = 'product_variants/var_jeans_azul.jpg'
        var_image_negra2 = 'product_variants/var_pantalon_negro.jpg'
        var_image_blanca2 = 'product_variants/var_zapatillas_blancas.jpg'
        var_image_negra3 = 'product_variants/var_zapatillas_negras.jpg'
        var_image_negra4 = 'product_variants/var_smartphone_negro.jpg'
        var_image_gris = 'product_variants/var_laptop_gris.jpg'
        var_image_cafe = 'product_variants/var_bolso_cafe.jpg'
        var_image_negra5 = 'product_variants/var_mochila_negra.jpg'

        var_image_reloj_negro = 'product_variants/var_reloj_negro.jpg'
        var_image_reloj_blanco = 'product_variants/var_reloj_blanco.jpg'
        var_image_gafas_negro = 'product_variants/var_gafas_negro.jpg'
        var_image_gafas_cafe = 'product_variants/var_gafas_cafe.jpg'
        var_image_gafas_gris = 'product_variants/var_gafas_gris.jpg'
        var_image_billetera = 'product_variants/var_billetera_oscura.jpg'

        # imágenes específicas por color para algunos productos
        var_image_smartphone_negro = 'product_variants/var_smartphone_negro.jpg'
        var_image_smartphone_blanco = 'product_variants/var_smartphone_blanco.jpg'
        var_image_iphone_negro = 'product_variants/var_iphone_negro.jpg'
        var_image_iphone_blanco = 'product_variants/var_iphone_blanco.jpg'
        var_image_tablet_negra = 'product_variants/var_tablet_negra.jpg'

        var_image_sandalias_premium_cafe = 'product_variants/var_sandalias_premium_cafe.jpg'
        var_image_sandalias_premium_negras = 'product_variants/var_sandalias_premium_negras.jpg'

        var_image_zapatillas_urban_negras = 'product_variants/var_zapatillas_urban_negras.jpg'
        var_image_zapatillas_urban_blancas = 'product_variants/var_zapatillas_urban_blancas.jpg'

        variants_data.extend([
            {'product': products[0], 'sku': 'CAM-BAS-BLA-S', 'size': size_s, 'color': color_blanco, 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'stock': Decimal('50'), 'image': var_image_blanca},
            {'product': products[0], 'sku': 'CAM-BAS-BLA-M', 'size': size_m, 'color': color_blanco, 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'stock': Decimal('75'), 'image': var_image_blanca},
            {'product': products[0], 'sku': 'CAM-BAS-BLA-L', 'size': size_l, 'color': color_blanco, 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'stock': Decimal('40'), 'image': var_image_blanca},
            {'product': products[0], 'sku': 'CAM-BAS-NEG-M', 'size': size_m, 'color': color_negro, 'cost': Decimal('15.00'), 'price': Decimal('29.90'), 'stock': Decimal('60'), 'image': var_image_negra},
        ])

        variants_data.extend([
            {'product': products[1], 'sku': 'CAM-DRY-AZU-M', 'size': size_m, 'color': color_azul, 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'stock': Decimal('40'), 'image': var_image_blanca},
            {'product': products[1], 'sku': 'CAM-DRY-NEG-L', 'size': size_l, 'color': color_negro, 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'stock': Decimal('35'), 'image': var_image_negra},
            {'product': products[1], 'sku': 'CAM-DRY-ROJ-M', 'size': size_m, 'color': color_rojo, 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'stock': Decimal('30'), 'image': var_image_negra},
        ])

        variants_data.extend([
            {'product': products[2], 'sku': 'CAM-OVR-GRI-L', 'size': size_l, 'color': color_gris, 'cost': Decimal('20.00'), 'price': Decimal('39.90'), 'stock': Decimal('35'), 'image': var_image_negra},
            # La variante XL la mapeamos también a L
            {'product': products[2], 'sku': 'CAM-OVR-GRI-XL', 'size': size_l, 'color': color_gris, 'cost': Decimal('20.00'), 'price': Decimal('39.90'), 'stock': Decimal('30'), 'image': var_image_negra},
            {'product': products[2], 'sku': 'CAM-OVR-NEG-L', 'size': size_l, 'color': color_negro, 'cost': Decimal('20.00'), 'price': Decimal('39.90'), 'stock': Decimal('25'), 'image': var_image_negra},
        ])

        # Jeans: usamos tallas S, M, L en lugar de numéricas
        variants_data.extend([
            {'product': products[3], 'sku': 'JEAN-28-BLA', 'size': size_s, 'color': color_azul, 'cost': Decimal('40.00'), 'price': Decimal('79.90'), 'stock': Decimal('20'), 'image': var_image_azul},
            {'product': products[3], 'sku': 'JEAN-30-AZU', 'size': size_m, 'color': color_azul, 'cost': Decimal('40.00'), 'price': Decimal('79.90'), 'stock': Decimal('25'), 'image': var_image_azul},
            {'product': products[3], 'sku': 'JEAN-32-AZU', 'size': size_l, 'color': color_azul, 'cost': Decimal('40.00'), 'price': Decimal('79.90'), 'stock': Decimal('15'), 'image': var_image_azul},
        ])

        variants_data.extend([
            {'product': products[4], 'sku': 'PANT-DEP-S', 'size': size_s, 'color': color_negro, 'cost': Decimal('30.00'), 'price': Decimal('59.90'), 'stock': Decimal('30'), 'image': var_image_negra2},
            {'product': products[4], 'sku': 'PANT-DEP-M', 'size': size_m, 'color': color_negro, 'cost': Decimal('30.00'), 'price': Decimal('59.90'), 'stock': Decimal('35'), 'image': var_image_negra2},
            {'product': products[4], 'sku': 'PANT-DEP-L', 'size': size_l, 'color': color_negro, 'cost': Decimal('30.00'), 'price': Decimal('59.90'), 'stock': Decimal('25'), 'image': var_image_negra2},
        ])

        variants_data.extend([
            {'product': products[5], 'sku': 'SHORT-M', 'size': size_m, 'color': color_azul, 'cost': Decimal('20.00'), 'price': Decimal('39.90'), 'stock': Decimal('40'), 'image': var_image_azul},
            {'product': products[5], 'sku': 'SHORT-L', 'size': size_l, 'color': color_azul, 'cost': Decimal('20.00'), 'price': Decimal('39.90'), 'stock': Decimal('30'), 'image': var_image_azul},
            # SHORT-XL lo mapeamos a L
            {'product': products[5], 'sku': 'SHORT-XL', 'size': size_l, 'color': color_gris, 'cost': Decimal('20.00'), 'price': Decimal('39.90'), 'stock': Decimal('25'), 'image': var_image_azul},
        ])

        # Zapatillas running: usamos S, M, L, Unitalla
        variants_data.extend([
            {'product': products[6], 'sku': 'ZAP-RUN-40-BLA', 'size': size_s, 'color': color_blanco, 'cost': Decimal('80.00'), 'price': Decimal('159.90'), 'stock': Decimal('15'), 'image': var_image_blanca2},
            {'product': products[6], 'sku': 'ZAP-RUN-41-BLA', 'size': size_m, 'color': color_blanco, 'cost': Decimal('80.00'), 'price': Decimal('159.90'), 'stock': Decimal('18'), 'image': var_image_blanca2},
            {'product': products[6], 'sku': 'ZAP-RUN-42-NEG', 'size': size_l, 'color': color_negro, 'cost': Decimal('80.00'), 'price': Decimal('159.90'), 'stock': Decimal('12'), 'image': var_image_negra3},
            {'product': products[6], 'sku': 'ZAP-RUN-43-NEG', 'size': size_unitalla, 'color': color_negro, 'cost': Decimal('80.00'), 'price': Decimal('159.90'), 'stock': Decimal('10'), 'image': var_image_negra3},
        ])

        variants_data.extend([
            {'product': products[7], 'sku': 'ZAP-URB-39-NEG', 'size': size_s, 'color': color_negro, 'cost': Decimal('50.00'), 'price': Decimal('99.90'), 'stock': Decimal('20'), 'image': var_image_zapatillas_urban_negras},
            {'product': products[7], 'sku': 'ZAP-URB-40-NEG', 'size': size_m, 'color': color_negro, 'cost': Decimal('50.00'), 'price': Decimal('99.90'), 'stock': Decimal('25'), 'image': var_image_zapatillas_urban_negras},
            {'product': products[7], 'sku': 'ZAP-URB-41-BLA', 'size': size_m, 'color': color_blanco, 'cost': Decimal('50.00'), 'price': Decimal('99.90'), 'stock': Decimal('15'), 'image': var_image_zapatillas_urban_blancas},
        ])

        variants_data.extend([
            {'product': products[8], 'sku': 'SAND-39-CAF', 'size': size_s, 'color': color_gris, 'cost': Decimal('35.00'), 'price': Decimal('69.90'), 'stock': Decimal('20'), 'image': var_image_sandalias_premium_cafe},
            {'product': products[8], 'sku': 'SAND-40-CAF', 'size': size_m, 'color': color_gris, 'cost': Decimal('35.00'), 'price': Decimal('69.90'), 'stock': Decimal('25'), 'image': var_image_sandalias_premium_cafe},
            {'product': products[8], 'sku': 'SAND-41-NEG', 'size': size_m, 'color': color_negro, 'cost': Decimal('35.00'), 'price': Decimal('69.90'), 'stock': Decimal('15'), 'image': var_image_sandalias_premium_negras},
        ])

        variants_data.extend([
            {'product': products[9], 'sku': 'GALAXY-128-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('500.00'), 'price': Decimal('899.00'), 'stock': Decimal('10'), 'image': var_image_smartphone_negro},
            {'product': products[9], 'sku': 'GALAXY-128-BLA', 'size': None, 'color': color_blanco, 'cost': Decimal('500.00'), 'price': Decimal('899.00'), 'stock': Decimal('8'), 'image': var_image_smartphone_blanco},
            {'product': products[9], 'sku': 'GALAXY-256-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('600.00'), 'price': Decimal('1099.00'), 'stock': Decimal('5'), 'image': var_image_smartphone_negro},
        ])

        variants_data.extend([
            {'product': products[10], 'sku': 'IPHONE-256-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('900.00'), 'price': Decimal('1499.00'), 'stock': Decimal('8'), 'image': var_image_iphone_negro},
            {'product': products[10], 'sku': 'IPHONE-256-BLA', 'size': None, 'color': color_blanco, 'cost': Decimal('900.00'), 'price': Decimal('1499.00'), 'stock': Decimal('6'), 'image': var_image_iphone_blanco},
            {'product': products[10], 'sku': 'IPHONE-512-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('1100.00'), 'price': Decimal('1899.00'), 'stock': Decimal('4'), 'image': var_image_iphone_negro},
        ])

        variants_data.extend([
            {'product': products[11], 'sku': 'LAPTOP-BUS-GRI', 'size': None, 'color': color_gris, 'cost': Decimal('1200.00'), 'price': Decimal('1899.00'), 'stock': Decimal('5'), 'image': var_image_gris},
        ])

        variants_data.extend([
            {'product': products[12], 'sku': 'TABLET-128-WIFI', 'size': None, 'color': color_negro, 'cost': Decimal('400.00'), 'price': Decimal('699.00'), 'stock': Decimal('10'), 'image': var_image_tablet_negra},
            {'product': products[12], 'sku': 'TABLET-128-CELL', 'size': None, 'color': color_negro, 'cost': Decimal('500.00'), 'price': Decimal('899.00'), 'stock': Decimal('6'), 'image': var_image_tablet_negra},
        ])

        variants_data.extend([
            {'product': products[13], 'sku': 'AUD-PRO-BLA', 'size': None, 'color': color_blanco, 'cost': Decimal('150.00'), 'price': Decimal('299.00'), 'stock': Decimal('15'), 'image': var_image_blanca},
            {'product': products[13], 'sku': 'AUD-PRO-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('150.00'), 'price': Decimal('299.00'), 'stock': Decimal('15'), 'image': var_image_negra},
        ])

        variants_data.extend([
            {'product': products[14], 'sku': 'TOTE-CAF', 'size': None, 'color': color_gris, 'cost': Decimal('60.00'), 'price': Decimal('129.90'), 'stock': Decimal('12'), 'image': var_image_cafe},
            {'product': products[14], 'sku': 'TOTE-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('60.00'), 'price': Decimal('129.90'), 'stock': Decimal('10'), 'image': var_image_cafe},
        ])

        variants_data.extend([
            {'product': products[15], 'sku': 'MOCHILA-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('50.00'), 'price': Decimal('99.90'), 'stock': Decimal('15'), 'image': var_image_negra5},
            {'product': products[15], 'sku': 'MOCHILA-GRI', 'size': None, 'color': color_gris, 'cost': Decimal('50.00'), 'price': Decimal('99.90'), 'stock': Decimal('12'), 'image': var_image_negra5},
        ])

        variants_data.extend([
            {'product': products[16], 'sku': 'RELOJ-S9-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('250.00'), 'price': Decimal('499.00'), 'stock': Decimal('8'), 'image': var_image_reloj_negro},
            {'product': products[16], 'sku': 'RELOJ-S9-BLA', 'size': None, 'color': color_blanco, 'cost': Decimal('250.00'), 'price': Decimal('499.00'), 'stock': Decimal('6'), 'image': var_image_reloj_blanco},
        ])

        variants_data.extend([
            {'product': products[17], 'sku': 'GAFAS-VINT-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('30.00'), 'price': Decimal('69.90'), 'stock': Decimal('20'), 'image': var_image_gafas_negro},
            {'product': products[17], 'sku': 'GAFAS-VINT-CAF', 'size': None, 'color': color_gris, 'cost': Decimal('30.00'), 'price': Decimal('69.90'), 'stock': Decimal('15'), 'image': var_image_gafas_cafe},
            {'product': products[17], 'sku': 'GAFAS-VINT-GRI', 'size': None, 'color': color_gris, 'cost': Decimal('30.00'), 'price': Decimal('69.90'), 'stock': Decimal('12'), 'image': var_image_gafas_gris},
        ])

        variants_data.extend([
            {'product': products[18], 'sku': 'BILLETERA-NEG', 'size': None, 'color': color_negro, 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'stock': Decimal('25'), 'image': var_image_billetera},
            {'product': products[18], 'sku': 'BILLETERA-CAF', 'size': None, 'color': color_gris, 'cost': Decimal('25.00'), 'price': Decimal('49.90'), 'stock': Decimal('20'), 'image': var_image_billetera},
        ])

        variants_data.extend([
            {'product': products[19], 'sku': 'SABANAS-BLA', 'size': None, 'color': color_blanco, 'cost': Decimal('60.00'), 'price': Decimal('119.90'), 'stock': Decimal('15'), 'image': var_image_blanca},
            {'product': products[19], 'sku': 'SABANAS-GRI', 'size': None, 'color': color_gris, 'cost': Decimal('60.00'), 'price': Decimal('119.90'), 'stock': Decimal('10'), 'image': var_image_blanca},
        ])

        for data in variants_data:
            try:
                stock = data.pop('stock')
                variant = ProductVariant.objects.create(**data)
                self.inventory_transaction_service.create_transaction(
                    variant_id=variant.id,
                    transaction_type_name='Entrada',
                    quantity=stock,
                    selected_uom_id=variant.product.base_uom_id,
                    reference=f'SEED-{variant.sku}',
                    notes='Carga inicial por seeder',
                )
                print(f"Created variant: {variant.sku}")
            except Exception as e:
                print(f"Variant error: {e}")

    def _get_sizes(self):
        try:
            # Solo consideramos S, M, L y Unitalla
            sizes = {s.name: s for s in Size.objects.all() if s.name in ['S', 'M', 'L', 'Unitalla']}
            if not sizes:
                sizes = {s.name: s for s in Size.objects.all()[:10]}
            return sizes
        except Exception as e:
            print(f'Sizes error: {e}')
            return {}

    def _get_colors(self):
        try:
            return {c.name: c for c in Color.objects.all() if c.name in ['Negro', 'Blanco', 'Azul', 'Rojo', 'Gris', 'Café']}
        except Exception as e:
            print(f'Colors error: {e}')
            return {}

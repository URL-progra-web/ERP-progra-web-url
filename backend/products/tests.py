import os
import shutil
import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from django.test.utils import override_settings

from crm.entrepreneur.models.models import Entrepreneur
from inventory.business_unit.models.models import BusinessUnit
from inventory.uom.models.models import UoM
from products.product.models.models import Product
from products.product.serializers.serializers import ProductSerializer
from products.size.models.models import Size
from products.color.models.models import Color
from products.variant.models.models import ProductVariant
from products.variant.serializers.serializers import ProductVariantSerializer


GIF_BYTES = (
    b'GIF87a\x01\x00\x01\x00\x80\x01\x00\x00\x00\x00ccc,'
    b'\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'
)


class ProductSerializerBaseTestCase(TestCase):
    def setUp(self):
        self.media_root = tempfile.mkdtemp()
        self.entrepreneur = Entrepreneur.objects.create(
            company_name='Marca Demo',
            contact_name='Contacto Demo',
        )
        self.business_unit = BusinessUnit.objects.create(name='Sucursal Central')
        self.override = override_settings(MEDIA_ROOT=self.media_root)
        self.override.enable()

    def tearDown(self):
        self.override.disable()
        shutil.rmtree(self.media_root, ignore_errors=True)

    def make_image(self, name='image.gif'):
        return SimpleUploadedFile(name, GIF_BYTES, content_type='image/gif')


class ProductVariantSerializerTests(ProductSerializerBaseTestCase):
    def setUp(self):
        super().setUp()
        self.uom = UoM.objects.create(code='und', name='Unidad')
        self.product = Product.objects.create(
            entrepreneur=self.entrepreneur,
            business_unit=self.business_unit,
            name='Camisa Polo',
        )
        self.size_s = Size.objects.create(name='S')
        self.size_m = Size.objects.create(name='M')
        self.size_l = Size.objects.create(name='L')
        self.color_blue = Color.objects.create(name='Azul')

    def test_keeps_stock_independent_for_each_size(self):
        serializer_s = ProductVariantSerializer(data={
            'product': self.product.id,
            'sku': 'POLO-S',
            'size': self.size_s.id,
            'color': self.color_blue.id,
            'uom': self.uom.id,
            'cost': '50.00',
            'price': '75.00',
            'quantity_available': 4,
            'is_active': True,
        })
        self.assertTrue(serializer_s.is_valid(), serializer_s.errors)
        variant_s = serializer_s.save()

        serializer_l = ProductVariantSerializer(data={
            'product': self.product.id,
            'sku': 'POLO-L',
            'size': self.size_l.id,
            'color': self.color_blue.id,
            'uom': self.uom.id,
            'cost': '50.00',
            'price': '75.00',
            'quantity_available': 7,
            'is_active': True,
        })
        self.assertTrue(serializer_l.is_valid(), serializer_l.errors)
        variant_l = serializer_l.save()

        self.assertEqual(ProductVariant.objects.get(pk=variant_s.pk).quantity_available, 4)
        self.assertEqual(ProductVariant.objects.get(pk=variant_l.pk).quantity_available, 7)

    def test_rejects_duplicate_product_size_color_combination(self):
        serializer = ProductVariantSerializer(data={
            'product': self.product.id,
            'sku': 'POLO-S-1',
            'size': self.size_s.id,
            'color': self.color_blue.id,
            'uom': self.uom.id,
            'cost': '50.00',
            'price': '75.00',
            'quantity_available': 4,
            'is_active': True,
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        serializer.save()

        duplicate = ProductVariantSerializer(data={
            'product': self.product.id,
            'sku': 'POLO-S-2',
            'size': self.size_s.id,
            'color': self.color_blue.id,
            'uom': self.uom.id,
            'cost': '50.00',
            'price': '75.00',
            'quantity_available': 9,
            'is_active': True,
        })
        self.assertFalse(duplicate.is_valid())
        self.assertIn('size', duplicate.errors)

    def test_exposes_image_url_when_variant_has_image(self):
        serializer = ProductVariantSerializer(data={
            'product': self.product.id,
            'sku': 'POLO-IMG',
            'size': self.size_s.id,
            'uom': self.uom.id,
            'cost': '50.00',
            'price': '75.00',
            'quantity_available': 3,
            'image': self.make_image('variant.gif'),
            'is_active': True,
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        variant = serializer.save()

        response_data = ProductVariantSerializer(instance=variant).data
        self.assertIn('/media/product_variants/', response_data['image_url'])

    def test_can_replace_and_remove_variant_image(self):
        serializer = ProductVariantSerializer(data={
            'product': self.product.id,
            'sku': 'POLO-IMG-EDIT',
            'size': self.size_m.id,
            'uom': self.uom.id,
            'cost': '40.00',
            'price': '60.00',
            'quantity_available': 2,
            'image': self.make_image('variant-original.gif'),
            'is_active': True,
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        variant = serializer.save()
        original_path = variant.image.path

        replace_serializer = ProductVariantSerializer(
            instance=variant,
            data={'image': self.make_image('variant-new.gif')},
            partial=True,
        )
        self.assertTrue(replace_serializer.is_valid(), replace_serializer.errors)
        variant = replace_serializer.save()
        updated_path = variant.image.path

        self.assertNotEqual(original_path, updated_path)
        self.assertFalse(os.path.exists(original_path))
        self.assertTrue(os.path.exists(updated_path))

        remove_serializer = ProductVariantSerializer(
            instance=variant,
            data={'remove_image': True},
            partial=True,
        )
        self.assertTrue(remove_serializer.is_valid(), remove_serializer.errors)
        variant = remove_serializer.save()

        self.assertFalse(variant.image)
        self.assertFalse(os.path.exists(updated_path))


class ProductSerializerTests(ProductSerializerBaseTestCase):
    def test_exposes_image_url_when_product_has_image(self):
        serializer = ProductSerializer(data={
            'name': 'Cafe Molido',
            'description': 'Paquete de 500g',
            'entrepreneur': self.entrepreneur.id,
            'business_unit': self.business_unit.id,
            'image': self.make_image('product.gif'),
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        product = serializer.save()

        response_data = ProductSerializer(instance=product).data
        self.assertIn('/media/products/', response_data['image_url'])

    def test_can_remove_product_image(self):
        serializer = ProductSerializer(data={
            'name': 'Cafe en grano',
            'entrepreneur': self.entrepreneur.id,
            'business_unit': self.business_unit.id,
            'image': self.make_image('product-remove.gif'),
        })
        self.assertTrue(serializer.is_valid(), serializer.errors)
        product = serializer.save()
        image_path = product.image.path

        update_serializer = ProductSerializer(
            instance=product,
            data={'remove_image': True},
            partial=True,
        )
        self.assertTrue(update_serializer.is_valid(), update_serializer.errors)
        product = update_serializer.save()

        self.assertFalse(product.image)
        self.assertFalse(os.path.exists(image_path))

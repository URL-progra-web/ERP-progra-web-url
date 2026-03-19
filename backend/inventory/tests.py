from django.test import TestCase
from inventory.uom.models.models import UoM
from inventory.uom_conversion.models.models import UoMConversion


class UoMServiceTests(TestCase):
    def setUp(self):
        from inventory.container import inventory_container
        self.service = inventory_container.uom_service

    def test_create_uom(self):
        uom = self.service.create_uom(code='kg', name='Kilogram')
        self.assertEqual(uom.code, 'kg')
        self.assertEqual(UoM.objects.count(), 1)

    def test_duplicate_code_is_blocked(self):
        self.service.create_uom(code='kg', name='Kilo')
        with self.assertRaises(ValueError):
            self.service.create_uom(code='kg', name='Another')


class UoMConversionServiceTests(TestCase):
    def setUp(self):
        from inventory.container import inventory_container
        self.uom_service = inventory_container.uom_service
        self.conv_service = inventory_container.uom_conversion_service
        self.kg = self.uom_service.create_uom(code='kg', name='Kilogram')
        self.g = self.uom_service.create_uom(code='g', name='Gram')

    def test_create_conversion(self):
        conv = self.conv_service.create_conversion(from_uom_id=self.kg.id, to_uom_id=self.g.id, multiplier=1000)
        self.assertEqual(conv.multiplier, 1000)

    def test_invalid_multiplier_fails(self):
        with self.assertRaises(ValueError):
            self.conv_service.create_conversion(from_uom_id=self.kg.id, to_uom_id=self.g.id, multiplier=0)

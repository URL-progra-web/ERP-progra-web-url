from django.test import TestCase
from unittest.mock import patch
from inventory.transaction.services.services import InventoryTransactionService
from inventory.transaction_type.models.models import TransactionType
from products.variant.models.models import ProductVariant
from products.product.models.models import Product
from crm.entrepreneur.models.models import Entrepreneur
from inventory.business_unit.models.models import BusinessUnit
from inventory.uom.models.models import UoM
from users.user.models.models import User
from users.role.models.models import Role

class InventoryTransactionServiceTests(TestCase):
    def setUp(self):
        self.role = Role.objects.create(name='Admin')
        self.user = User.objects.create(name='Test User', role=self.role)
        self.ent = Entrepreneur.objects.create(company_name='Test Ent', contact_name='Test Contact')
        self.bu = BusinessUnit.objects.create(name='Test BU')
        self.product = Product.objects.create(
            entrepreneur=self.ent,
            business_unit=self.bu,
            name='Test Product'
        )
        self.uom = UoM.objects.create(code='UN', name='Unidad')
        self.variant = ProductVariant.objects.create(
            product=self.product,
            sku='SKU-001',
            uom=self.uom,
            cost=10,
            price=20,
            quantity_available=100
        )
        
        self.tt_in = TransactionType.objects.create(name='Entrada', factor=1)
        self.tt_out = TransactionType.objects.create(name='Salida', factor=-1)
        
        self.service = InventoryTransactionService()

    def test_create_transaction_success_in(self):
        txn = self.service.create_transaction(
            variant_id=self.variant.id,
            transaction_type_name='Entrada',
            quantity=50,
            user=self.user,
            reference='Test Ref IN'
        )
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.quantity_available, 150)
        self.assertEqual(txn.quantity, 50)
        self.assertEqual(txn.transaction_type, self.tt_in)

    def test_create_transaction_success_out(self):
        txn = self.service.create_transaction(
            variant_id=self.variant.id,
            transaction_type_name='Salida',
            quantity=20,
            user=self.user,
            reference='Test Ref OUT'
        )
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.quantity_available, 80)
        self.assertEqual(txn.quantity, 20)

    def test_delete_transaction_bug(self):
        txn = self.service.create_transaction(
            variant_id=self.variant.id,
            transaction_type_name='Entrada',
            quantity=30,
            user=self.user,
            reference='Test Delete'
        )
        self.variant.refresh_from_db()
        self.assertEqual(self.variant.quantity_available, 130)

        try:
            self.service.delete_transaction(txn.id)
            self.variant.refresh_from_db()
            self.assertEqual(self.variant.quantity_available, 100)
        except NameError as e:
            self.fail(f"NameError was raised! Bug is present: {str(e)}")

    @patch('inventory.transaction.services.services.InventoryTransactionRepository.create')
    def test_transaction_atomicity_bug(self, mock_create):
        mock_create.side_effect = Exception("DB Insert Failed")
        
        with self.assertRaises(Exception):
            self.service.create_transaction(
                variant_id=self.variant.id,
                transaction_type_name='Entrada',
                quantity=40,
                user=self.user,
                reference='Test Atomic Bug'
            )
            
        self.variant.refresh_from_db()
        self.assertEqual(
            self.variant.quantity_available, 
            100, 
            "Stock was modified even though transaction creation failed! Atomicity is broken."
        )

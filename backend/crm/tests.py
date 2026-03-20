from django.test import TestCase

from crm.customer.exceptions import CustomerAlreadyExists
from crm.customer.models.models import Customer
from crm.customer.services.services import CustomerService


class CustomerServiceTests(TestCase):
    def setUp(self):
        self.service = CustomerService()

    def test_create_customer_success(self):
        customer = self.service.create_customer(name='Guest', phone='12345678', email='guest@example.com')
        self.assertEqual(customer.email, 'guest@example.com')
        self.assertEqual(Customer.objects.count(), 1)

    def test_duplicate_phone_is_blocked(self):
        self.service.create_customer(name='Guest', phone='9999')
        with self.assertRaises(CustomerAlreadyExists):
            self.service.create_customer(name='Another', phone='9999')

    def test_update_customer_success(self):
        customer = self.service.create_customer(name='Old Name', phone='1111')
        updated = self.service.update_customer(customer.id, name='New Name')
        self.assertEqual(updated.name, 'New Name')

    def test_update_duplicate_email_fails(self):
        self.service.create_customer(name='A', phone='1', email='a@test.com')
        b = self.service.create_customer(name='B', phone='2', email='b@test.com')
        with self.assertRaises(CustomerAlreadyExists):
            self.service.update_customer(b.id, email='a@test.com')

    def test_delete_customer(self):
        customer = self.service.create_customer(name='To Delete', phone='000')
        self.service.delete_customer(customer.id)
        self.assertEqual(Customer.objects.count(), 0)

    def test_list_with_search(self):
        self.service.create_customer(name='John Doe', phone='123')
        self.service.create_customer(name='Jane Smith', phone='456')
        results = self.service.list_customers(search='John')
        self.assertEqual(results.count(), 1)
        self.assertEqual(results[0].name, 'John Doe')

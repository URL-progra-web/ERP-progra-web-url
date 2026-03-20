from django.test import TestCase
from users.user.models.models import User
from users.role.models.models import Role
from users.container import user_container


class RoleServiceTests(TestCase):
    def setUp(self):
        self.service = user_container.role_service

    def test_create_role(self):
        role = self.service.create_role(name='ADMIN', description='Administrator')
        self.assertEqual(role.name, 'ADMIN')
        self.assertEqual(Role.objects.count(), 1)

    def test_duplicate_role_is_blocked(self):
        self.service.create_role(name='ADMIN')
        with self.assertRaises(ValueError):
            self.service.create_role(name='ADMIN')

    def test_list_roles(self):
        self.service.create_role(name='ADMIN')
        self.service.create_role(name='USER')
        roles = self.service.list_roles()
        self.assertEqual(len(roles), 2)


class UserServiceTests(TestCase):
    def setUp(self):
        self.role_service = user_container.role_service
        self.user_service = user_container.user_service
        self.admin_role = self.role_service.create_role(name='ADMIN')

    def test_create_user(self):
        user = self.user_service.create_user(
            name='Test User',
            role_id=self.admin_role.id,
            email='test@example.com',
            password='password123'
        )
        self.assertEqual(user.name, 'Test User')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.is_active)
        self.assertEqual(User.objects.count(), 1)

    def test_duplicate_email_is_blocked(self):
        self.user_service.create_user(
            name='User 1',
            role_id=self.admin_role.id,
            email='dup@example.com'
        )
        with self.assertRaises(ValueError):
            self.user_service.create_user(
                name='User 2',
                role_id=self.admin_role.id,
                email='dup@example.com'
            )

    def test_verify_password(self):
        self.user_service.create_user(
            name='Auth User',
            role_id=self.admin_role.id,
            email='auth@example.com',
            password='secret_password'
        )
        # Correct password
        user = self.user_service.verify_password('auth@example.com', 'secret_password')
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'auth@example.com')

        # Wrong password
        user = self.user_service.verify_password('auth@example.com', 'wrong_password')
        self.assertIsNone(user)

    def test_toggle_active_status(self):
        user = self.user_service.create_user(
            name='Toggle User',
            role_id=self.admin_role.id
        )
        self.assertTrue(user.is_active)
        
        # Deactivate
        updated_user = self.user_service.toggle_active_status(user.id)
        self.assertFalse(updated_user.is_active)
        
        # Reactivate
        updated_user = self.user_service.toggle_active_status(user.id)
        self.assertTrue(updated_user.is_active)

    def test_update_user(self):
        user = self.user_service.create_user(
            name='Old Name',
            role_id=self.admin_role.id,
            email='old@example.com'
        )
        
        updated_user = self.user_service.update_user(
            user_id=user.id,
            name='New Name',
            email='new@example.com'
        )
        
        self.assertEqual(updated_user.name, 'New Name')
        self.assertEqual(updated_user.email, 'new@example.com')

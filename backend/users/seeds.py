import os

from django.contrib.auth.hashers import make_password

from core.seeds import BaseSeeder
from users.role.services.services import RoleService
from users.user.services.services import UserService

class UserSeeder(BaseSeeder):
    def __init__(self, role_service: RoleService = None, user_service: UserService = None):
        super().__init__()
        self.role_service = role_service or RoleService()
        self.user_service = user_service or UserService()

    def run(self):
        # Create Roles
        roles = [
            ('ADMIN', 'Administrator with full access'),
        ]

        role_objs = {}
        for name, desc in roles:
            try:
                role = self.role_service.create_role(name=name, description=desc)
                role_objs[name] = role
                print(f"Created {name} role.")
            except ValueError:
                role = self.role_service.get_role_by_name(name)
                role_objs[name] = role
                print(f"{name} role already exists.")

        # Create or update the demo admin user.
        admin_role = role_objs.get('ADMIN')
        if admin_role:
            admin_name = os.environ.get('DEMO_ADMIN_NAME', 'Super Admin')
            admin_email = os.environ.get('DEMO_ADMIN_EMAIL', 'admin@admin.com')
            admin_password = os.environ.get('DEMO_ADMIN_PASSWORD', 'admin')

            existing_user = self.user_service.get_user_by_email(admin_email)
            if existing_user:
                existing_user.name = admin_name
                existing_user.role = admin_role
                existing_user.is_active = True
                existing_user.password_hash = make_password(admin_password)
                existing_user.save()
                print(f"Updated {admin_email} user.")
            else:
                self.user_service.create_user(
                    name=admin_name,
                    role_id=admin_role.id,
                    email=admin_email,
                    password=admin_password
                )
                print(f"Created {admin_email} user.")

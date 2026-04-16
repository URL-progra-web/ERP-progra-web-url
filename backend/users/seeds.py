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

        # Create Admin user
        admin_role = role_objs.get('ADMIN')
        if admin_role:
            try:
                self.user_service.create_user(
                    name='Super Admin',
                    role_id=admin_role.id,
                    email='admin@admin.com',
                    password='admin'
                )
                print("Created admin@erp.com user.")
            except ValueError as e:
                print(f"Admin user creation skipped: {e}")

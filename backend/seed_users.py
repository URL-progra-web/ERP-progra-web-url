import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from users.role.services.services import RoleService
from users.user.services.services import UserService

def seed():
    role_service = RoleService()
    user_service = UserService()

    # Create Roles
    try:
        admin_role = role_service.create_role(name='ADMIN', description='Administrator with full access')
        print("Created ADMIN role.")
    except ValueError:
        admin_role = role_service.get_role_by_name('ADMIN')
        print("ADMIN role already exists.")

    try:
        manager_role = role_service.create_role(name='MANAGER', description='Manager with limited access')
        print("Created MANAGER role.")
    except ValueError:
        manager_role = role_service.get_role_by_name('MANAGER')
        print("MANAGER role already exists.")

    try:
        visitor_role = role_service.create_role(name='VISITOR', description='Read-only visitor')
        print("Created VISITOR role.")
    except ValueError:
        visitor_role = role_service.get_role_by_name('VISITOR')
        print("VISITOR role already exists.")

    # Create Admin user
    try:
        user_service.create_user(
            name='Super Admin',
            role_id=admin_role.id,
            email='admin@erp.com',
            password='adminpassword'
        )
        print("Created admin@erp.com user.")
    except ValueError as e:
        print(f"Admin user creation skipped: {e}")

if __name__ == '__main__':
    seed()

from typing import Optional, List
from django.contrib.auth.hashers import make_password, check_password
from users.user.models.models import User
from users.user.repositories.repositories import UserRepository
from users.role.services.services import RoleService

class UserService:
    def __init__(self):
        self.repository = UserRepository()
        self.role_service = RoleService()

    def get_user(self, user_id: int) -> Optional[User]:
        return self.repository.get_by_id(user_id)

    def get_user_by_email(self, email: str) -> Optional[User]:
        return self.repository.get_by_email(email)

    def list_users(self) -> List[User]:
        return self.repository.get_all()

    def list_users_filtered(self, search: str = None, role_id: int = None, is_active: bool = None):
        return self.repository.get_filtered(search=search, role_id=role_id, is_active=is_active)

    def create_user(self, name: str, role_id: int, email: str = None, password: str = None) -> User:
        if email and self.get_user_by_email(email):
            raise ValueError(f"User with email {email} already exists.")
        
        role = self.role_service.get_role(role_id)
        if not role:
            raise ValueError(f"Role with id {role_id} does not exist.")

        password_hash = make_password(password) if password else None
        return self.repository.create(
            name=name, 
            role=role, 
            email=email, 
            password_hash=password_hash
        )

    def update_user(self, user_id: int, name: str = None, role_id: int = None, email: str = None) -> User:
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with id {user_id} not found.")
            
        if email and email != user.email:
            if self.get_user_by_email(email):
                raise ValueError(f"User with email {email} already exists.")
            user.email = email
            
        if name:
            user.name = name
            
        if role_id:
            role = self.role_service.get_role(role_id)
            if not role:
                raise ValueError(f"Role with id {role_id} does not exist.")
            user.role = role
            
        return self.repository.update(user)

    def toggle_active_status(self, user_id: int) -> User:
        user = self.get_user(user_id)
        if not user:
            raise ValueError(f"User with id {user_id} not found.")
        
        user.is_active = not user.is_active
        return self.repository.update(user)

    def verify_password(self, email: str, password: str) -> Optional[User]:
        user = self.get_user_by_email(email)
        if user and user.is_active and user.password_hash and check_password(password, user.password_hash):
            return user
        return None

from typing import Dict, Any, Tuple
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.db.models import Q
from apps.users.repositories.user_repository import UserRepository
from apps.users.user.models.user_model import User

class UserService:
    @staticmethod
    def get_all_users(is_active: bool = None, search: str = None):
        users = UserRepository.get_all_users()
        
        if is_active is not None:
            users = users.filter(is_active=is_active)
            
        if search:
            users = users.filter(
                Q(email__icontains=search) | 
                Q(first_name__icontains=search) | 
                Q(last_name__icontains=search)
            )
            
        return users.distinct()

    @staticmethod
    def get_user_by_id(user_id: int):
        user = UserRepository.get_user_by_id(user_id)
        if not user:
            raise ValidationError(f"User with id {user_id} not found.")
        return user

    @staticmethod
    def _validate_admin_privileges(request_user: User, data: Dict[str, Any]):
        """
        Valida que si se intenta asignar is_staff, is_superuser o el grupo 'Admin',
        el usuario que hace la petición tenga permisos suficientes (ser superuser o pertenecer a Admin).
        """
        is_assigning_staff = data.get('is_staff', False)
        is_assigning_superuser = data.get('is_superuser', False)
        
        # 'groups' in validated_data will be a list of Group instances because of PrimaryKeyRelatedField
        groups = data.get('groups', [])
        is_assigning_admin_group = any(g.name == 'Admin' for g in groups)
        
        if is_assigning_staff or is_assigning_superuser or is_assigning_admin_group:
            # Check if request_user has rights
            has_rights = request_user.is_superuser or request_user.groups.filter(name='Admin').exists()
            if not has_rights:
                raise ValidationError("No tienes permisos suficientes para otorgar privilegios administrativos (is_staff, is_superuser o rol Admin).")

    @staticmethod
    def create_user(request_user: User, data: Dict[str, Any]) -> Tuple[User, str]:
        email = data.get('email')
        if not email:
            raise ValidationError("Email is required.")
            
        UserService._validate_admin_privileges(request_user, data)
            
        try:
            user = UserRepository.create_user(data)
            return user, "User created successfully"
        except IntegrityError:
            raise ValidationError("User with this email already exists.")

    @staticmethod
    def update_user(request_user: User, user_id: int, data: Dict[str, Any]) -> Tuple[User, str]:
        user = UserService.get_user_by_id(user_id)
        
        UserService._validate_admin_privileges(request_user, data)
        
        # Enforce email immutability on updates
        if 'email' in data:
            del data['email']
                
        updated_user = UserRepository.update_user(user, data)
        return updated_user, "User updated successfully"

    @staticmethod
    def delete_user(user_id: int) -> Tuple[User, str]:
        user = UserService.get_user_by_id(user_id)
        deleted_user = UserRepository.soft_delete_user(user)
        return deleted_user, "User deleted successfully"

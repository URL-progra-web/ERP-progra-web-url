from django.core.exceptions import ObjectDoesNotExist
from apps.users.user.models.user_model import User
from django.db.models import QuerySet

class UserRepository:
    """
    Repository para abstraer el acceso a User.objects.
    Centraliza todas las queries relacionadas con usuarios.
    """
    
    @staticmethod
    def get_all_users() -> QuerySet:
        return User.objects.all()

    @staticmethod
    def get_user_by_id(user_id: int) -> User | None:
        """Busca usuario por ID. Retorna None si no existe."""
        try:
            return User.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def get_user_by_email(email: str) -> User | None:
        """Busca usuario por email. Retorna None si no existe."""
        try:
            return User.objects.get(email=email)
        except ObjectDoesNotExist:
            return None

    @staticmethod
    def create_user(data: dict) -> User:
        # Extraer password para hashearlo con create_user
        password = data.pop('password', None)
        # Extraer grupos si existen
        groups = data.pop('groups', [])
        
        user = User.objects.create_user(password=password, **data)
        
        if groups:
            user.groups.set(groups)
        
        return user

    @staticmethod
    def update_user(user: User, data: dict) -> User:
        groups = data.pop('groups', None)
        
        # Iterar sobre los datos y actualizar el objeto
        for attr, value in data.items():
            if attr == 'password':
                user.set_password(value)
            else:
                setattr(user, attr, value)
        
        user.save()
        
        if groups is not None:
            user.groups.set(groups)
            
        return user

    @staticmethod
    def soft_delete_user(user: User) -> User:
        user.is_active = False
        user.save()
        return user

from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from apps.users.repositories.user_repository import UserRepository
from apps.users.user.models.user_model import User


class AuthService:

    @staticmethod
    def validate_credentials(email: str, password: str) -> User | None:
        user = UserRepository.get_user_by_email(email)
        
        if user is None:
            return None
        
        if not user.is_active:
            return None
        
        if not user.check_password(password):
            return None
        
        return user

    @staticmethod
    def generate_tokens(user: User) -> dict:
        refresh = RefreshToken.for_user(user)
        
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }

    @staticmethod
    def login(email: str, password: str) -> dict | None:
        user = AuthService.validate_credentials(email, password)
        
        if user is None:
            return None
        
        tokens = AuthService.generate_tokens(user)
        
        return {
            'user': user,
            'tokens': tokens,
        }

    @staticmethod
    def refresh_token(refresh_token: str) -> dict | None:
        try:
            refresh = RefreshToken(refresh_token)
            
            # Generar nuevo access token
            new_access = str(refresh.access_token)
            
            # Con ROTATE_REFRESH_TOKENS=True, SimpleJWT genera nuevo refresh automáticamente
            # Pero debemos hacerlo manualmente aquí para devolverlo
            new_refresh = str(refresh)
            
            return {
                'access': new_access,
                'refresh': new_refresh,
            }
        except TokenError:
            # Token inválido, expirado o en blacklist
            return None

    @staticmethod
    def logout(refresh_token: str) -> bool:
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return True
        except TokenError:
            return False

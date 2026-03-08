from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from apps.users.repositories.user_repository import UserRepository


class JWTAuthMiddleware(MiddlewareMixin):
    
    BYPASS_ADMIN_EMAIL = 'admin@bypass.local'
    
    def process_request(self, request):

        if not settings.BYPASS_AUTH:
            # Comportamiento normal - no hace nada, deja que JWT maneje la auth
            return None
        
        # BYPASS_AUTH activo - asignar usuario admin
        bypass_user = self._get_or_create_bypass_user()
        
        if bypass_user:
            request.user = bypass_user
            request._bypass_auth_active = True  # Flag para debugging
        
        return None
    
    def _get_or_create_bypass_user(self):

        from apps.users.user.models.user_model import User
        
        # Intentar obtener usuario de bypass existente
        user = UserRepository.get_user_by_email(self.BYPASS_ADMIN_EMAIL)
        
        if user:
            return user
        
        # Crear usuario de bypass si no existe
        try:
            user = User.objects.create_superuser(
                email=self.BYPASS_ADMIN_EMAIL,
                password='bypass_dev_password_not_for_production',
                first_name='Bypass',
                last_name='Admin',
            )
            return user
        except Exception:
            # Si falla la creación, intentar obtener cualquier superuser
            try:
                return User.objects.filter(is_superuser=True, is_active=True).first()
            except Exception:
                return None

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework.authentication import CSRFCheck
from rest_framework import exceptions
from django.conf import settings


# Nombres de las cookies (deben coincidir con las vistas)
ACCESS_TOKEN_COOKIE_NAME = 'access_token'
REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'


class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Intentar obtener el access token de las cookies
        raw_token = request.COOKIES.get(ACCESS_TOKEN_COOKIE_NAME)
        
        if raw_token is None:
            # No hay cookie, permitir que otras clases de auth intenten
            # o que la vista maneje el caso de usuario anónimo
            return None
        
        # Validar el token
        try:
            validated_token = self.get_validated_token(raw_token)
        except TokenError as e:
            raise InvalidToken(
                {
                    'detail': 'Token inválido o expirado.',
                    'messages': [str(e)]
                }
            )
        
        # Obtener el usuario del token
        try:
            user = self.get_user(validated_token)
        except Exception:
            raise InvalidToken({'detail': 'Usuario no encontrado.'})
        
        if user is None:
            raise InvalidToken({'detail': 'Usuario no encontrado.'})
        
        if not user.is_active:
            raise InvalidToken({'detail': 'Usuario inactivo.'})
        
        return (user, validated_token)

    def authenticate_header(self, request):
        return 'Cookie realm="api"'


class CookieJWTAuthenticationWithHeader(CookieJWTAuthentication):
    def authenticate(self, request):
        # Primero intentar cookies
        raw_token = request.COOKIES.get(ACCESS_TOKEN_COOKIE_NAME)
        
        if raw_token is not None:
            # Hay cookie, usar autenticación por cookie
            try:
                validated_token = self.get_validated_token(raw_token)
                user = self.get_user(validated_token)
                
                if user and user.is_active:
                    return (user, validated_token)
            except TokenError:
                # Cookie inválida, intentar header
                pass
        
        # Fallback al comportamiento original (header Authorization)
        return super(JWTAuthentication, self).authenticate(request)

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiExample
from django.conf import settings

from apps.users.services.auth_service import AuthService
from apps.users.serializers.user_serializer import LoginSerializer, UserSerializer


ACCESS_TOKEN_COOKIE_NAME = 'access_token'
REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'

# Tiempos de expiración (deben coincidir con SIMPLE_JWT en settings.py)
ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 15           # 15 minutos
REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 días

# Path para las cookies (solo se envían a rutas de la API)
COOKIE_PATH = '/api/'


def set_auth_cookies(response, access_token: str, refresh_token: str):
    # Cookie para access token
    response.set_cookie(
        key=ACCESS_TOKEN_COOKIE_NAME,
        value=access_token,
        max_age=ACCESS_TOKEN_COOKIE_MAX_AGE,
        httponly=True,
        secure=not settings.DEBUG,  # HTTPS en producción
        samesite='Lax',
        path=COOKIE_PATH,
    )
    
    # Cookie para refresh token
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        max_age=REFRESH_TOKEN_COOKIE_MAX_AGE,
        httponly=True,
        secure=not settings.DEBUG,
        samesite='Lax',
        path=COOKIE_PATH,
    )
    
    return response


def clear_auth_cookies(response):
    response.delete_cookie(ACCESS_TOKEN_COOKIE_NAME, path=COOKIE_PATH)
    response.delete_cookie(REFRESH_TOKEN_COOKIE_NAME, path=COOKIE_PATH)
    return response


class LoginView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="User Login",
        description="Authenticate user with email and password. Sets both access and refresh tokens in HttpOnly cookies. Returns user profile only (no tokens in response body).",
        request=LoginSerializer,
        responses={
            200: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "user": {"type": "object", "description": "User profile data"}
                }
            },
            401: {"description": "Invalid credentials"}
        },
        examples=[
            OpenApiExample(
                "Login request",
                value={"email": "user@example.com", "password": "password123"},
                request_only=True,
            )
        ]
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']
        
        result = AuthService.login(email, password)
        
        if result is None:
            return Response(
                {"detail": "Credenciales inválidas o usuario inactivo."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        user_data = UserSerializer(result['user']).data
        
        # Respuesta sin tokens en el body (solo usuario y mensaje)
        response = Response(
            {
                "message": "Login exitoso.",
                "user": user_data,
            },
            status=status.HTTP_200_OK
        )
        
        # Setear ambos tokens en cookies HttpOnly
        set_auth_cookies(
            response,
            access_token=result['tokens']['access'],
            refresh_token=result['tokens']['refresh']
        )
        
        return response


class RefreshTokenView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Refresh Access Token",
        description="Get new access and refresh tokens using the refresh token stored in HttpOnly cookie. Both tokens are rotated and set in cookies. No tokens in response body.",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "message": {"type": "string", "description": "Success message"}
                }
            },
            401: {"description": "Invalid or expired refresh token"}
        }
    )
    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)
        
        if not refresh_token:
            return Response(
                {"detail": "Refresh token no encontrado en cookies."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        result = AuthService.refresh_token(refresh_token)
        
        if result is None:
            response = Response(
                {"detail": "Refresh token inválido o expirado."},
                status=status.HTTP_401_UNAUTHORIZED
            )
            # Limpiar cookies inválidas
            clear_auth_cookies(response)
            return response
        
        # Respuesta sin tokens en el body
        response = Response(
            {"message": "Tokens renovados exitosamente."},
            status=status.HTTP_200_OK
        )
        
        # Setear nuevos tokens en cookies
        set_auth_cookies(
            response,
            access_token=result['access'],
            refresh_token=result['refresh']
        )
        
        return response


class LogoutView(APIView):
    permission_classes = [AllowAny]  # Permitir logout incluso si token expiró

    @extend_schema(
        summary="User Logout",
        description="Invalidate the refresh token (add to blacklist) and clear both auth cookies.",
        responses={
            200: {"description": "Logout successful"}
        }
    )
    def post(self, request):
        refresh_token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)
        
        # Intentar invalidar el refresh token si existe
        if refresh_token:
            AuthService.logout(refresh_token)
        
        response = Response(
            {"message": "Logout exitoso."},
            status=status.HTTP_200_OK
        )
        
        # Eliminar ambas cookies de autenticación
        clear_auth_cookies(response)
        
        return response


class MeView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    @extend_schema(
        summary="Get Current User",
        description="Returns the profile of the currently authenticated user.",
        responses={200: UserSerializer}
    )
    def get(self, request, *args, **kwargs):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    def get_object(self):
        return self.request.user

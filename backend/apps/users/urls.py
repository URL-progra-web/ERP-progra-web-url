from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.routers.user_router import UserViewSet
from apps.users.routers.auth_router import LoginView, RefreshTokenView, LogoutView, MeView

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    
    path('auth/login/', LoginView.as_view(), name='auth-login'),
    path('auth/refresh/', RefreshTokenView.as_view(), name='auth-refresh'),
    path('auth/logout/', LogoutView.as_view(), name='auth-logout'),
    path('auth/me/', MeView.as_view(), name='auth-me'),
    
    path('', include(router.urls)),
]

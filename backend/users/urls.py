from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.user.apis.views import UserViewSet
from users.role.apis.views import RoleViewSet

user_router = DefaultRouter()
user_router.register(r'', UserViewSet, basename='user')

role_router = DefaultRouter()
role_router.register(r'', RoleViewSet, basename='role')

urlpatterns = [
    path('login/', UserViewSet.as_view({'post': 'login'})),
    path('users/', include(user_router.urls)),
    path('roles/', include(role_router.urls)),
]

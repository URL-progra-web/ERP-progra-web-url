class HasRole(BasePermission):

    def __init__(self, roles=None):
        self.roles = roles or []

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False

        # Regla de negocio actual
        for role in self.roles:
            if role == 'admin' and user.is_superuser:
                return True
            if role == 'user' and user.is_authenticated:
                return True
        return False

    @classmethod
    def as_permission(cls, roles):
        """Permite usar HasRole.as_permission(['admin']) en CBV/FBV"""
        return cls(roles)


def get_user_or_403(request, required_role=None):
    from rest_framework.exceptions import PermissionDenied
    user = getattr(request, 'user', None)
    if not user or not user.is_authenticated:
        raise PermissionDenied("No autenticado")
    if required_role == 'admin' and not user.is_superuser:
        raise PermissionDenied("Se requiere rol admin")
    if required_role == 'user' and not user.is_authenticated:
        raise PermissionDenied("Se requiere usuario autenticado")
    return user


def has_role(user, role_names) -> bool:
    if not user or not user.is_authenticated:
        return False
    
    # Superuser siempre tiene todos los roles
    if user.is_superuser:
        return True
    
    # Normalizar a lista
    if isinstance(role_names, str):
        role_names = [role_names]
    
    # Verificar membresía en grupos de Django
    # Esto es extensible: puedes agregar lógica para roles custom aquí
    user_groups = user.groups.values_list('name', flat=True)
    
    for role in role_names:
        if role in user_groups:
            return True
    
    return False


class IsSuperUser(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_superuser
        )


class IsAdminOrReadOnly(BasePermission):
    SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.method in self.SAFE_METHODS:
            return True
        
        return request.user.is_staff or request.user.is_superuser


class HasRoleOrReadOnly(BasePermission):
    SAFE_METHODS = ('GET', 'HEAD', 'OPTIONS')
    
    def has_permission(self, request, view):
        user = request.user
        
        if not user or not user.is_authenticated:
            return False
        
        if request.method in self.SAFE_METHODS:
            return True
        
        # Para métodos de escritura, verificar roles
        if user.is_superuser:
            return True
        
        required_roles = getattr(view, 'required_roles', [])
        
        if not required_roles:
            return True
        
        return has_role(user, required_roles)

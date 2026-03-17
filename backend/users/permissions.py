from rest_framework import permissions

class HasRole(permissions.BasePermission):
    """
    Allows access only to users that have a specific role.
    Expects view to have `allowed_roles` attribute (list of role names).
    """

    def has_permission(self, request, view):
        import logging
        logger = logging.getLogger(__name__)
        
        if not request.user:
            print("No request.user")
            return False
            
        if not request.user.is_authenticated:
            print("request.user not authenticated")
            return False
        
        allowed_roles = getattr(view, 'allowed_roles', [])
        
        if not allowed_roles:
            return True

        print(f"User: {request.user.name}, Role: {request.user.role.name if hasattr(request.user, 'role') and request.user.role else 'None'}, Allowed: {allowed_roles}")

        if hasattr(request.user, 'role') and request.user.role:
            return request.user.role.name in allowed_roles
            
        print("User has no role attribute or role is None")
        return False

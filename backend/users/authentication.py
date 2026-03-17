from rest_framework import authentication
from rest_framework import exceptions
from rest_framework_simplejwt.tokens import UntypedToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from users.user.services.services import UserService

class CustomJWTAuthentication(authentication.BaseAuthentication):
    def __init__(self):
        self.user_service = UserService()
        
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        parts = auth_header.split()

        if parts[0].lower() != 'bearer':
            return None

        if len(parts) == 1:
            raise exceptions.AuthenticationFailed('Invalid token header. No credentials provided.')
        elif len(parts) > 2:
            raise exceptions.AuthenticationFailed('Invalid token header. Token string should not contain spaces.')

        token = parts[1]

        try:
            # Validate token using SimpleJWT UntypedToken
            validated_token = UntypedToken(token)
        except (InvalidToken, TokenError) as e:
            raise exceptions.AuthenticationFailed(f"Token is invalid or expired: {e}")

        # The payload contains 'user_id' by default
        user_id = validated_token.payload.get('user_id')
        if not user_id:
            raise exceptions.AuthenticationFailed('Token contained no recognizable user identification')

        user = self.user_service.get_user(user_id)

        if not user:
            raise exceptions.AuthenticationFailed('User not found')

        return (user, validated_token)

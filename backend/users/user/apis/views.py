from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from users.user.serializers.serializers import UserSerializer, UserCreateSerializer
from users.user.services.services import UserService
from users.permissions import HasRole

class UserViewSet(viewsets.ViewSet):
    # Default permissions for the viewset
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = UserService()

    def get_permissions(self):
        """Override permissions per action."""
        if self.action == 'login':
            return [AllowAny()]
        if self.action == 'me':
            return [IsAuthenticated()]  # Any authenticated user can get their own data
        return [IsAuthenticated(), HasRole()]

    def list(self, request):
        search = request.query_params.get('search', '').strip() or None
        role_id = request.query_params.get('role_id') or None
        is_active_param = request.query_params.get('is_active')
        is_active = None
        if is_active_param == 'true':
            is_active = True
        elif is_active_param == 'false':
            is_active = False

        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = min(100, max(1, int(request.query_params.get('page_size', 20))))
        except (ValueError, TypeError):
            page = 1
            page_size = 20

        qs = self.service.list_users_filtered(
            search=search,
            role_id=int(role_id) if role_id else None,
            is_active=is_active
        )

        from django.core.paginator import Paginator
        paginator = Paginator(qs, page_size)
        page_obj = paginator.get_page(page)

        serializer = UserSerializer(page_obj.object_list, many=True)
        return Response({
            'results': serializer.data,
            'count': paginator.count,
            'num_pages': paginator.num_pages,
            'page': page,
            'page_size': page_size,
        })

    def retrieve(self, request, pk=None):
        user = self.service.get_user(pk)
        if not user:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = UserSerializer(user)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def me(self, request):
        """Return the currently authenticated user. Used to validate token on app startup."""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({'error': 'Please provide both email and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = self.service.verify_password(email, password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        # Generate JWT
        refresh = RefreshToken.for_user(user) # Note: simplejwt normally expects Django Auth User model
        # We will need to customize the SimpleJWT backend to use our User model implicitly
        # or we patch the token payload
        refresh['email'] = user.email
        if user.role:
            refresh['role'] = user.role.name

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })

    def create(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = self.service.create_user(**serializer.validated_data)
                return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        try:
            user = self.service.update_user(
                user_id=pk,
                name=request.data.get('name'),
                role_id=request.data.get('role_id'),
                email=request.data.get('email')
            )
            return Response(UserSerializer(user).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['patch'])
    def toggle_active(self, request, pk=None):
        try:
            user = self.service.toggle_active_status(pk)
            return Response(UserSerializer(user).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

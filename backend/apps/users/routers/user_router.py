from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.core.exceptions import ValidationError
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema, OpenApiExample, OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from apps.users.services.user_service import UserService
from apps.users.serializers.user_serializer import UserReadSerializer, UserWriteSerializer

class UserViewSet(viewsets.ViewSet):
    """
    ViewSet para manejar el CRUD de usuarios.
    Solo accesible para administradores (is_staff=True o is_superuser=True).
    """
    permission_classes = [IsAdminUser]

    @extend_schema(
        summary="List users",
        description="List all system users with Pagination. Supports filtering by `is_active` and searching across email and names.",
        parameters=[
            OpenApiParameter(
                name='page',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='A page number within the paginated result set.',
                required=False,
            ),
            OpenApiParameter(
                name='is_active',
                type=OpenApiTypes.BOOL,
                location=OpenApiParameter.QUERY,
                description='Filter users by active status',
                required=False,
            ),
            OpenApiParameter(
                name='search',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Search users by email, first_name or last_name',
                required=False,
            ),
        ]
    )
    def list(self, request):
        is_active = request.query_params.get('is_active')
        search = request.query_params.get('search')
        
        # Convertir a booleano si viene el param
        if is_active is not None:
            is_active = is_active.lower() == 'true'

        users = UserService.get_all_users(is_active=is_active, search=search)
        
        # Paginación
        paginator = PageNumberPagination()
        paginated_users = paginator.paginate_queryset(users, request)
        
        if paginated_users is not None:
            serializer = UserReadSerializer(paginated_users, many=True)
            return paginator.get_paginated_response(serializer.data)
            
        serializer = UserReadSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Create a new user",
        description="Creates a new user assigning roles optionally.",
        request=UserWriteSerializer,
        responses={201: UserReadSerializer},
        examples=[
            OpenApiExample(
                "Valid request example",
                value={
                    "email": "nuevo_usuario@empresa.com",
                    "password": "Password123!",
                    "first_name": "Juan",
                    "last_name": "Perez",
                    "phone": "5551234567",
                    "is_active": True,
                    "is_staff": False,
                    "groups": []
                },
                request_only=True,
            )
        ]
    )
    def create(self, request):
        serializer = UserWriteSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user, message = UserService.create_user(request.user, serializer.validated_data)
                return Response(
                    {"message": message, "data": UserReadSerializer(user).data}, 
                    status=status.HTTP_201_CREATED
                )
            except ValidationError as e:
                return Response({"detail": str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({"detail": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Retrieve user details",
        description="Gets the properties of a specific user by its ID.",
        responses=UserReadSerializer,
    )
    def retrieve(self, request, pk=None):
        try:
            user = UserService.get_user_by_id(pk)
            serializer = UserReadSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ValidationError as e:
            return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)

    @extend_schema(
        summary="Modify a user",
        description="Partially updates user details. If password is provided, it will be automatically hashed. Pass `groups` as array of integers to modify roles.",
        request=UserWriteSerializer,
        responses={200: UserReadSerializer},
        examples=[
            OpenApiExample(
                "Change last name payload",
                value={"last_name": "Nuevo Apellido"},
                request_only=True,
            ),
            OpenApiExample(
                "Reset password payload",
                value={"password": "NewStrongPassword456"},
                request_only=True,
            )
        ]
    )
    def partial_update(self, request, pk=None):
        # Usamos partial=True porque es PATCH
        serializer = UserWriteSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            try:
                user, message = UserService.update_user(request.user, pk, serializer.validated_data)
                return Response(
                    {"message": message, "data": UserReadSerializer(user).data}, 
                    status=status.HTTP_200_OK
                )
            except ValidationError as e:
                return Response({"detail": str(e.message)}, status=status.HTTP_400_BAD_REQUEST)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(
        summary="Deactivate user",
        description="Soft deletes the user by switching `is_active` to False instead of destroying the record.",
        responses={204: None}
    )
    def destroy(self, request, pk=None):
        try:
            user, message = UserService.delete_user(pk)
            return Response({"message": message}, status=status.HTTP_204_NO_CONTENT)
        except ValidationError as e:
            return Response({"detail": str(e.message)}, status=status.HTTP_404_NOT_FOUND)

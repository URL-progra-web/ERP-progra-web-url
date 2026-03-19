from rest_framework import viewsets, status
from rest_framework.response import Response
from users.role.models.models import Role
from users.role.serializers.serializers import RoleSerializer
from users.container import user_container
from users.permissions import HasRole
from rest_framework.permissions import IsAuthenticated

class RoleViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN'] # Only admins can manage roles

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = user_container.role_service

    def list(self, request):
        roles = self.service.list_roles()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        role = self.service.get_role(pk)
        if not role:
            return Response({'error': 'Not found'}, status=status.HTTP_404_NOT_FOUND)
        serializer = RoleSerializer(role)
        return Response(serializer.data)

    def create(self, request):
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            try:
                role = self.service.create_role(**serializer.validated_data)
                return Response(RoleSerializer(role).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

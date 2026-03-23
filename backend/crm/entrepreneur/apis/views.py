from datetime import datetime

from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import PaginationMixin
from crm.entrepreneur.exceptions import EntrepreneurAlreadyExists, EntrepreneurNotFound
from crm.entrepreneur.serializers.serializers import EntrepreneurSerializer, EntrepreneurWriteSerializer
from crm.entrepreneur.services.services import EntrepreneurService
from users.permissions import HasRole
from users.user.models.models import User


class EntrepreneurViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = EntrepreneurService()

    def list(self, request):
        search = request.query_params.get('search') or None
        created_from = self._parse_datetime(request.query_params.get('created_from'))
        created_to = self._parse_datetime(request.query_params.get('created_to'), end_of_day=True)

        qs = self.service.list_entrepreneurs(search=search, created_from=created_from, created_to=created_to)
        return self.paginate_queryset(qs, EntrepreneurSerializer, request)

    def retrieve(self, request, pk=None):
        try:
            entrepreneur = self.service.get_entrepreneur(self._parse_pk(pk))
        except EntrepreneurNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(EntrepreneurSerializer(entrepreneur).data)

    def create(self, request):
        serializer = EntrepreneurWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            entrepreneur = self.service.create_entrepreneur(**serializer.validated_data)
        except (ValueError, EntrepreneurAlreadyExists) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(EntrepreneurSerializer(entrepreneur).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        serializer = EntrepreneurWriteSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            entrepreneur = self.service.update_entrepreneur(self._parse_pk(pk), **serializer.validated_data)
        except EntrepreneurNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, EntrepreneurAlreadyExists) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(EntrepreneurSerializer(entrepreneur).data)

    def destroy(self, request, pk=None):
        try:
            self.service.delete_entrepreneur(self._parse_pk(pk))
        except EntrepreneurNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='users')
    def get_users(self, request):
        """Endpoint para obtener la lista de usuarios disponibles para el dropdown."""
        users = User.objects.filter(is_active=True).values('id', 'username', 'email', 'first_name', 'last_name')
        return Response(list(users))

    @staticmethod
    def _parse_pk(pk) -> int:
        try:
            return int(pk)
        except (TypeError, ValueError):
            raise EntrepreneurNotFound('Identificador de emprendedor inválido')

    @staticmethod
    def _parse_datetime(value: str, end_of_day: bool = False):
        if not value:
            return None
        parsed = parse_datetime(value)
        if parsed:
            return parsed
        parsed_date = parse_date(value)
        if parsed_date:
            time_of_day = datetime.max.time() if end_of_day else datetime.min.time()
            return datetime.combine(parsed_date, time_of_day)
        return None

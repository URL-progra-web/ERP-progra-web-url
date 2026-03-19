from datetime import datetime

from django.utils.dateparse import parse_date, parse_datetime
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import PaginationMixin
from crm.customer.exceptions import CustomerAlreadyExists, CustomerNotFound
from crm.customer.serializers.serializers import CustomerSerializer, CustomerWriteSerializer
from crm.customer.services.services import CustomerService
from users.permissions import HasRole


class CustomerViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = CustomerService()

    def list(self, request):
        search = request.query_params.get('search') or None
        created_from = self._parse_datetime(request.query_params.get('created_from'))
        created_to = self._parse_datetime(request.query_params.get('created_to'))

        qs = self.service.list_customers(search=search, created_from=created_from, created_to=created_to)
        return self.paginate_queryset(qs, CustomerSerializer, request)

    def retrieve(self, request, pk=None):
        try:
            customer = self.service.get_customer(self._parse_pk(pk))
        except CustomerNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(CustomerSerializer(customer).data)

    def create(self, request):
        serializer = CustomerWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            customer = self.service.create_customer(**serializer.validated_data)
        except (ValueError, CustomerAlreadyExists) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CustomerSerializer(customer).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        serializer = CustomerWriteSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            customer = self.service.update_customer(self._parse_pk(pk), **serializer.validated_data)
        except CustomerNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, CustomerAlreadyExists) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(CustomerSerializer(customer).data)

    def destroy(self, request, pk=None):
        try:
            self.service.delete_customer(self._parse_pk(pk))
        except CustomerNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def _parse_pk(pk) -> int:
        try:
            return int(pk)
        except (TypeError, ValueError):
            raise CustomerNotFound('Identificador de cliente inválido')

    @staticmethod
    def _parse_datetime(value: str):
        if not value:
            return None
        parsed = parse_datetime(value)
        if parsed:
            return parsed
        parsed_date = parse_date(value)
        if parsed_date:
            return datetime.combine(parsed_date, datetime.min.time())
        return None

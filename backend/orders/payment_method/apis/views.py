from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import PaginationMixin
from orders.payment_method.serializers.serializers import (
    PaymentMethodSerializer,
    PaymentMethodStatusSerializer,
    PaymentMethodWriteSerializer,
)
from orders.payment_method.services.services import PaymentMethodService
from orders.payment_method.exceptions import (
    PaymentMethodAlreadyExists,
    PaymentMethodInUse,
    PaymentMethodNotFound,
)
from users.permissions import HasRole


class PaymentMethodViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = PaymentMethodService()

    def list(self, request):
        search = request.query_params.get('search') or None
        is_active_param = (request.query_params.get('is_active') or '').lower()
        is_active = None
        if is_active_param in {'true', '1'}:
            is_active = True
        elif is_active_param in {'false', '0'}:
            is_active = False

        qs = self.service.list_methods(search=search, is_active=is_active)
        return self.paginate_queryset(qs, PaymentMethodSerializer, request)

    def retrieve(self, request, pk=None):
        try:
            method_id = self._parse_pk(pk)
            method = self.service.get_method(method_id)
        except PaymentMethodNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        serializer = PaymentMethodSerializer(method)
        return Response(serializer.data)

    def create(self, request):
        serializer = PaymentMethodWriteSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            method = self.service.create_method(**serializer.validated_data)
        except (ValueError, PaymentMethodAlreadyExists) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PaymentMethodSerializer(method).data, status=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        serializer = PaymentMethodWriteSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            method_id = self._parse_pk(pk)
            method = self.service.update_method(method_id, **serializer.validated_data)
        except PaymentMethodNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, PaymentMethodAlreadyExists) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(PaymentMethodSerializer(method).data)

    def partial_update(self, request, pk=None):
        return self.update(request, pk)

    def destroy(self, request, pk=None):
        try:
            method_id = self._parse_pk(pk)
            self.service.delete_method(method_id)
        except PaymentMethodNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (ValueError, PaymentMethodInUse) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def _parse_pk(pk) -> int:
        try:
            return int(pk)
        except (TypeError, ValueError):
            raise PaymentMethodNotFound('Identificador de método de pago inválido')

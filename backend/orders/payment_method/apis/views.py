from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import PaginationMixin
from orders.payment_method.serializers.serializers import (
    PaymentMethodSerializer,
    PaymentMethodStatusSerializer,
)
from orders.payment_method.services.services import PaymentMethodService
from orders.payment_method.exceptions import PaymentMethodNotFound
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
        return Response(
            {'error': 'La creación de métodos de pago está deshabilitada.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def update(self, request, pk=None):
        return Response(
            {'error': 'Utiliza PATCH para actualizar el estado.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, pk=None):
        serializer = PaymentMethodStatusSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            method_id = self._parse_pk(pk)
            method = self.service.set_active_state(method_id, serializer.validated_data['is_active'])
        except PaymentMethodNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(PaymentMethodSerializer(method).data)

    def destroy(self, request, pk=None):
        return Response(
            {'error': 'No se permite eliminar métodos de pago.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @staticmethod
    def _parse_pk(pk) -> int:
        try:
            return int(pk)
        except (TypeError, ValueError):
            raise PaymentMethodNotFound('Identificador de método de pago inválido')

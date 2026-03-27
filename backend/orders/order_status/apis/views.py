from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import PaginationMixin
from orders.order_item.exceptions import OrderItemStockUnavailable
from orders.order_status.exceptions import (
    InvalidOrderStatusTransition,
    OrderAlreadyTerminal,
    OrderStatusNotFound,
)
from orders.order_status.serializers.serializers import (
    OrderStatusSerializer,
    OrderStatusTransitionSerializer,
)
from orders.order_status.services.services import OrderStatusService
from orders.order.exceptions import OrderNotFound
from users.permissions import HasRole


class OrderStatusViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = OrderStatusService()

    def list(self, request):
        search = request.query_params.get('search') or None
        qs = self.service.list_statuses(search=search)
        return self.paginate_queryset(qs, OrderStatusSerializer, request)

    def retrieve(self, request, pk=None):
        try:
            status_id = self._parse_pk(pk)
            status_obj = self.service.get_status(status_id)
        except OrderStatusNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        serializer = OrderStatusSerializer(status_obj)
        return Response(serializer.data)

    def create(self, request):
        return Response(
            {'error': 'La creación de estados está deshabilitada.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def update(self, request, pk=None):
        return Response(
            {'error': 'La edición de estados está deshabilitada.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def partial_update(self, request, pk=None):
        return Response(
            {'error': 'La edición de estados está deshabilitada.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    def destroy(self, request, pk=None):
        return Response(
            {'error': 'La eliminación de estados está deshabilitada.'},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )

    @action(detail=False, methods=['get'])
    def transitions(self, request):
        return Response({
            'workflow': self.service.allowed_transitions,
            'terminal_statuses': list(self.service.terminal_statuses),
        })

    @action(detail=False, methods=['post'])
    def transition(self, request):
        serializer = OrderStatusTransitionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            order = self.service.transition_order(
                order_id=serializer.validated_data['order_id'],
                target_status_name=serializer.validated_data['target_status'],
                notes=serializer.validated_data.get('notes'),
                actor=request.user,
            )
        except (OrderNotFound, OrderStatusNotFound) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except (InvalidOrderStatusTransition, OrderAlreadyTerminal, OrderItemStockUnavailable) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({
            'order_id': order.id,
            'order_short_id': order.short_id,
            'status': order.status.name,
        })

    @staticmethod
    def _parse_pk(pk) -> int:
        try:
            return int(pk)
        except (TypeError, ValueError):
            raise OrderStatusNotFound('Identificador de estado inválido')

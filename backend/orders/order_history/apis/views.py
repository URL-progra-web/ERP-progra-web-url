from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.order_history.models.models import OrderStatusHistory
from orders.order_history.serializers.serializers import OrderStatusHistorySerializer
from orders.order.exceptions import OrderNotFound
from orders.order.services.services import OrderService
from users.permissions import HasRole


class OrderHistoryAPIView(APIView):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = OrderService()

    def get(self, request, pk=None):
        try:
            order = self.service.get_order(pk)
        except OrderNotFound:
            return Response(
                {'error': 'Orden no encontrada', 'code': 'order_not_found'},
                status=status.HTTP_404_NOT_FOUND,
            )

        history = OrderStatusHistory.objects.filter(order=order).order_by('-created_at')
        serializer = OrderStatusHistorySerializer(history, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
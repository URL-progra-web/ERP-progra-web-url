from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.order.exceptions import (
    DuplicateOrderShortId,
    InvalidOrderData,
    OrderNotFound,
    OrderStatusDefaultNotConfigured,
)
from orders.order.serializers.serializers import (
    CustomerLookupSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    OrderUpdateSerializer,
    PaymentMethodLookupSerializer,
)
from orders.order.services.catalogs import get_order_catalogs
from orders.container import orders_container
from users.permissions import HasRole


class OrderAPIView(APIView):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = orders_container.order_service

    def get(self, request):
        try:
            orders = self.service.list_orders()
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return Response({'error': 'No se pudieron listar las órdenes'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Datos inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            validated_data = serializer.validated_data
            order = self.service.create_order(
                customer=validated_data['customer_id'],
                status=validated_data.get('status_id'),
                payment_method=validated_data.get('payment_method_id'),
                short_id=validated_data.get('short_id'),
                shipping_address=validated_data.get('shipping_address'),
                shipping_cost=validated_data.get('shipping_cost', 0.00),
                notes=validated_data.get('notes'),
            )
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except (InvalidOrderData, DuplicateOrderShortId, OrderStatusDefaultNotConfigured) as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({'error': 'No se pudo crear la orden'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = orders_container.order_service

    @staticmethod
    def _parse_pk(pk) -> int:
        try:
            return int(pk)
        except (TypeError, ValueError):
            raise OrderNotFound('Identificador de orden inválido')

    def get(self, request, pk=None):
        try:
            order = self.service.get_order(self._parse_pk(pk))
        except OrderNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    def put(self, request, pk=None):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk=None):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk=None, partial: bool = False):
        serializer = OrderUpdateSerializer(data=request.data, partial=partial)
        if not serializer.is_valid():
            return Response({'error': 'Datos inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = self.service.update_order(
                order_id=self._parse_pk(pk),
                customer=serializer.validated_data.get('customer_id'),
                payment_method=serializer.validated_data.get('payment_method_id'),
                status=serializer.validated_data.get('status_id'),
                shipping_address=serializer.validated_data.get('shipping_address'),
                shipping_cost=serializer.validated_data.get('shipping_cost'),
                notes=serializer.validated_data.get('notes'),
            )
        except OrderNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        except InvalidOrderData as exc:
            return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    def delete(self, request, pk=None):
        try:
            self.service.delete_order(self._parse_pk(pk))
        except OrderNotFound as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class OrderCatalogAPIView(APIView):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def get(self, request):
        customers, payment_methods = get_order_catalogs()
        return Response({
            'customers': CustomerLookupSerializer(customers, many=True).data,
            'payment_methods': PaymentMethodLookupSerializer(payment_methods, many=True).data,
        }, status=status.HTTP_200_OK)

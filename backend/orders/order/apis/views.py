from django.http import HttpResponse
from re import search

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.order.exceptions import (
    DuplicateOrderShortId,
    InvalidOrderData,
    OrderDeleteNotAllowed,
    OrderNotFound,
    OrderStatusDefaultNotConfigured,
)
from orders.order_item.exceptions import (
    DuplicateOrderItemVariant,
    InvalidOrderItemData,
    OrderItemBusinessUnitMismatch,
    OrderItemStatusDefaultNotConfigured,
    OrderItemStockUnavailable,
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

    @staticmethod
    def _error_response(message: str, code: str, http_status: int, details=None):
        payload = {
            'error': message,
            'code': code,
        }
        if details is not None:
            payload['details'] = details
        return Response(payload, status=http_status)

    @staticmethod
    def _order_error_code(exc: Exception) -> str:
        mapping = {
            InvalidOrderData: 'order_invalid_data',
            DuplicateOrderShortId: 'order_duplicate_short_id',
            OrderStatusDefaultNotConfigured: 'order_default_status_missing',
            OrderItemStockUnavailable: 'order_item_stock_unavailable',
            OrderItemBusinessUnitMismatch: 'order_item_business_unit_mismatch',
            OrderItemStatusDefaultNotConfigured: 'order_item_default_status_missing',
            DuplicateOrderItemVariant: 'order_item_duplicate_variant',
            InvalidOrderItemData: 'order_item_invalid_data',
            OrderDeleteNotAllowed: 'order_delete_not_allowed',
        }
        for exc_type, code in mapping.items():
            if isinstance(exc, exc_type):
                return code
        return 'order_unknown_error'

    def get(self, request):
        try:
            search = request.query_params.get('search')
            orders = self.service.list_orders(search=search)
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception:
            return self._error_response(
                message='No se pudieron listar las órdenes',
                code='order_list_failed',
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return self._error_response(
                message='Datos inválidos',
                code='validation_error',
                http_status=status.HTTP_400_BAD_REQUEST,
                details=serializer.errors,
            )

        try:
            validated_data = serializer.validated_data
            items = validated_data.get('items') or []
            if items:
                items_payload = [
                    {
                        'variant_id': item['variant_id'].id,
                        'quantity': item['quantity'],
                        'selected_uom': item['selected_uom_id'],
                        'status': item.get('status_id'),
                    }
                    for item in items
                ]
                order = self.service.create_order_with_items(
                    customer=validated_data['customer_id'],
                    items_payload=items_payload,
                    status=validated_data.get('status_id'),
                    payment_method=validated_data.get('payment_method_id'),
                    shipping_address=validated_data.get('shipping_address'),
                    shipping_cost=validated_data.get('shipping_cost', 0.00),
                    notes=validated_data.get('notes'),
                )
            else:
                order = self.service.create_order(
                    customer=validated_data['customer_id'],
                    status=validated_data.get('status_id'),
                    payment_method=validated_data.get('payment_method_id'),
                    shipping_address=validated_data.get('shipping_address'),
                    shipping_cost=validated_data.get('shipping_cost', 0.00),
                    notes=validated_data.get('notes'),
                )
            return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except (
            InvalidOrderData,
            DuplicateOrderShortId,
            OrderStatusDefaultNotConfigured,
            OrderItemStockUnavailable,
            OrderItemBusinessUnitMismatch,
            OrderItemStatusDefaultNotConfigured,
            DuplicateOrderItemVariant,
            InvalidOrderItemData,
        ) as exc:
            return self._error_response(
                message=str(exc),
                code=self._order_error_code(exc),
                http_status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception:
            return self._error_response(
                message='No se pudo crear la orden',
                code='order_create_failed',
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class OrderDetailAPIView(APIView):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = orders_container.order_service

    @staticmethod
    def _error_response(message: str, code: str, http_status: int, details=None):
        payload = {
            'error': message,
            'code': code,
        }
        if details is not None:
            payload['details'] = details
        return Response(payload, status=http_status)

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
            return self._error_response(str(exc), 'order_not_found', status.HTTP_404_NOT_FOUND)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    def put(self, request, pk=None):
        return self._update(request, pk, partial=False)

    def patch(self, request, pk=None):
        return self._update(request, pk, partial=True)

    def _update(self, request, pk=None, partial: bool = False):
        serializer = OrderUpdateSerializer(data=request.data, partial=partial)
        if not serializer.is_valid():
            return self._error_response(
                message='Datos inválidos',
                code='validation_error',
                http_status=status.HTTP_400_BAD_REQUEST,
                details=serializer.errors,
            )

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
            return self._error_response(str(exc), 'order_not_found', status.HTTP_404_NOT_FOUND)
        except InvalidOrderData as exc:
            return self._error_response(str(exc), 'order_invalid_data', status.HTTP_400_BAD_REQUEST)
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)

    def delete(self, request, pk=None):
        try:
            self.service.delete_order(self._parse_pk(pk))
        except OrderNotFound as exc:
            return self._error_response(str(exc), 'order_not_found', status.HTTP_404_NOT_FOUND)
        except OrderDeleteNotAllowed as exc:
            return self._error_response(str(exc), 'order_delete_not_allowed', status.HTTP_409_CONFLICT)
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


class OrderExportExcelAPIView(APIView):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = orders_container.order_service

    @staticmethod
    def _error_response(message: str, code: str, http_status: int):
        return Response({'error': message, 'code': code}, status=http_status)

    def get(self, request):
        date_from = request.query_params.get('date_from')  # YYYY-MM-DD
        date_to = request.query_params.get('date_to')      # YYYY-MM-DD
        try:
            content = self.service.export_orders_excel(date_from=date_from, date_to=date_to)
        except Exception:
            return self._error_response(
                message='No se pudo generar el archivo Excel',
                code='order_excel_failed',
                http_status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        response = HttpResponse(
            content,
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="pedidos.xlsx"'
        return response

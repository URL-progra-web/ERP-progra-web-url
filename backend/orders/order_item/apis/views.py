from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.container import orders_container
from orders.order.exceptions import OrderNotFound
from orders.order_item.exceptions import (
	DuplicateOrderItemVariant,
	InvalidOrderItemData,
	OrderItemBusinessUnitMismatch,
	OrderItemNotFound,
	OrderItemStatusDefaultNotConfigured,
	OrderItemStockUnavailable,
)
from orders.order_item.serializers.serializers import (
	OrderItemBulkCreateSerializer,
	OrderItemCreateSerializer,
	OrderItemSerializer,
	OrderItemUpdateSerializer,
)
from users.permissions import HasRole


class OrderItemAPIView(APIView):
	permission_classes = [IsAuthenticated, HasRole]
	allowed_roles = ['ADMIN', 'MANAGER']

	def __init__(self, **kwargs):
		super().__init__(**kwargs)
		self.service = orders_container.order_item_service

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
	def _item_error_code(exc: Exception) -> str:
		mapping = {
			InvalidOrderItemData: 'order_item_invalid_data',
			OrderItemStockUnavailable: 'order_item_stock_unavailable',
			OrderItemBusinessUnitMismatch: 'order_item_business_unit_mismatch',
			OrderItemStatusDefaultNotConfigured: 'order_item_default_status_missing',
			DuplicateOrderItemVariant: 'order_item_duplicate_variant',
		}
		for exc_type, code in mapping.items():
			if isinstance(exc, exc_type):
				return code
		return 'order_item_unknown_error'

	def get(self, request):
		order_id = request.query_params.get('order_id')
		parsed_order_id = None
		if order_id is not None:
			try:
				parsed_order_id = int(order_id)
			except (TypeError, ValueError):
				return self._error_response('order_id inválido', 'validation_error', status.HTTP_400_BAD_REQUEST)

		items = self.service.list_items(order_id=parsed_order_id)
		return Response(OrderItemSerializer(items, many=True).data, status=status.HTTP_200_OK)

	def post(self, request):
		serializer = OrderItemCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return self._error_response(
				'Datos inválidos',
				'validation_error',
				status.HTTP_400_BAD_REQUEST,
				serializer.errors,
			)

		try:
			item = self.service.create_item(
				order_id=serializer.validated_data['order_id'].id,
				variant_id=serializer.validated_data['variant_id'].id,
				quantity=serializer.validated_data['quantity'],
				selected_uom=serializer.validated_data['selected_uom_id'],
				status=serializer.validated_data.get('status_id'),
			)
		except OrderNotFound as exc:
			return self._error_response(str(exc), 'order_not_found', status.HTTP_404_NOT_FOUND)
		except (
			InvalidOrderItemData,
			OrderItemStockUnavailable,
			OrderItemBusinessUnitMismatch,
			OrderItemStatusDefaultNotConfigured,
			DuplicateOrderItemVariant,
		) as exc:
			return self._error_response(
				str(exc),
				self._item_error_code(exc),
				status.HTTP_400_BAD_REQUEST,
			)

		return Response(OrderItemSerializer(item).data, status=status.HTTP_201_CREATED)


class OrderItemBulkCreateAPIView(APIView):
	permission_classes = [IsAuthenticated, HasRole]
	allowed_roles = ['ADMIN', 'MANAGER']

	def __init__(self, **kwargs):
		super().__init__(**kwargs)
		self.service = orders_container.order_item_service

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
	def _item_error_code(exc: Exception) -> str:
		mapping = {
			InvalidOrderItemData: 'order_item_invalid_data',
			OrderItemStockUnavailable: 'order_item_stock_unavailable',
			OrderItemBusinessUnitMismatch: 'order_item_business_unit_mismatch',
			OrderItemStatusDefaultNotConfigured: 'order_item_default_status_missing',
			DuplicateOrderItemVariant: 'order_item_duplicate_variant',
		}
		for exc_type, code in mapping.items():
			if isinstance(exc, exc_type):
				return code
		return 'order_item_unknown_error'

	def post(self, request):
		serializer = OrderItemBulkCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return self._error_response(
				'Datos inválidos',
				'validation_error',
				status.HTTP_400_BAD_REQUEST,
				serializer.errors,
			)

		items_payload = []
		for item in serializer.validated_data['items']:
			items_payload.append({
				'variant_id': item['variant_id'].id,
				'quantity': item['quantity'],
				'selected_uom': item['selected_uom_id'],
				'status': item.get('status_id'),
			})

		try:
			items = self.service.create_items_for_order(
				order_id=serializer.validated_data['order_id'].id,
				items_payload=items_payload,
			)
		except OrderNotFound as exc:
			return self._error_response(str(exc), 'order_not_found', status.HTTP_404_NOT_FOUND)
		except (
			InvalidOrderItemData,
			OrderItemStockUnavailable,
			OrderItemBusinessUnitMismatch,
			OrderItemStatusDefaultNotConfigured,
			DuplicateOrderItemVariant,
		) as exc:
			return self._error_response(
				str(exc),
				self._item_error_code(exc),
				status.HTTP_400_BAD_REQUEST,
			)

		return Response(OrderItemSerializer(items, many=True).data, status=status.HTTP_201_CREATED)


class OrderItemDetailAPIView(APIView):
	permission_classes = [IsAuthenticated, HasRole]
	allowed_roles = ['ADMIN', 'MANAGER']

	def __init__(self, **kwargs):
		super().__init__(**kwargs)
		self.service = orders_container.order_item_service

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
	def _item_error_code(exc: Exception) -> str:
		mapping = {
			InvalidOrderItemData: 'order_item_invalid_data',
			OrderItemStockUnavailable: 'order_item_stock_unavailable',
			OrderItemBusinessUnitMismatch: 'order_item_business_unit_mismatch',
			DuplicateOrderItemVariant: 'order_item_duplicate_variant',
		}
		for exc_type, code in mapping.items():
			if isinstance(exc, exc_type):
				return code
		return 'order_item_unknown_error'

	@staticmethod
	def _parse_pk(pk) -> int:
		try:
			return int(pk)
		except (TypeError, ValueError):
			raise OrderItemNotFound('Identificador de item inválido')

	def get(self, request, pk=None):
		try:
			item = self.service.get_item(self._parse_pk(pk))
		except OrderItemNotFound as exc:
			return self._error_response(str(exc), 'order_item_not_found', status.HTTP_404_NOT_FOUND)
		return Response(OrderItemSerializer(item).data, status=status.HTTP_200_OK)

	def patch(self, request, pk=None):
		serializer = OrderItemUpdateSerializer(data=request.data, partial=True)
		if not serializer.is_valid():
			return self._error_response(
				'Datos inválidos',
				'validation_error',
				status.HTTP_400_BAD_REQUEST,
				serializer.errors,
			)

		try:
			item = self.service.update_item(
				item_id=self._parse_pk(pk),
				quantity=serializer.validated_data.get('quantity'),
				selected_uom=serializer.validated_data.get('selected_uom_id'),
				status=serializer.validated_data.get('status_id'),
			)
		except OrderItemNotFound as exc:
			return self._error_response(str(exc), 'order_item_not_found', status.HTTP_404_NOT_FOUND)
		except (
			InvalidOrderItemData,
			OrderItemStockUnavailable,
			OrderItemBusinessUnitMismatch,
			DuplicateOrderItemVariant,
		) as exc:
			return self._error_response(
				str(exc),
				self._item_error_code(exc),
				status.HTTP_400_BAD_REQUEST,
			)

		return Response(OrderItemSerializer(item).data, status=status.HTTP_200_OK)

	def delete(self, request, pk=None):
		try:
			self.service.delete_item(self._parse_pk(pk))
		except OrderItemNotFound as exc:
			return self._error_response(str(exc), 'order_item_not_found', status.HTTP_404_NOT_FOUND)
		return Response(status=status.HTTP_204_NO_CONTENT)

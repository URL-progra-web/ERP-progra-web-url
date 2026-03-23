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

	def get(self, request):
		order_id = request.query_params.get('order_id')
		parsed_order_id = None
		if order_id is not None:
			try:
				parsed_order_id = int(order_id)
			except (TypeError, ValueError):
				return Response({'error': 'order_id inválido'}, status=status.HTTP_400_BAD_REQUEST)

		items = self.service.list_items(order_id=parsed_order_id)
		return Response(OrderItemSerializer(items, many=True).data, status=status.HTTP_200_OK)

	def post(self, request):
		serializer = OrderItemCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response({'error': 'Datos inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

		try:
			item = self.service.create_item(
				order_id=serializer.validated_data['order_id'].id,
				variant_id=serializer.validated_data['variant_id'].id,
				quantity=serializer.validated_data['quantity'],
				status=serializer.validated_data.get('status_id'),
			)
		except OrderNotFound as exc:
			return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
		except (
			InvalidOrderItemData,
			OrderItemStockUnavailable,
			OrderItemBusinessUnitMismatch,
			OrderItemStatusDefaultNotConfigured,
			DuplicateOrderItemVariant,
		) as exc:
			return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		return Response(OrderItemSerializer(item).data, status=status.HTTP_201_CREATED)


class OrderItemBulkCreateAPIView(APIView):
	permission_classes = [IsAuthenticated, HasRole]
	allowed_roles = ['ADMIN', 'MANAGER']

	def __init__(self, **kwargs):
		super().__init__(**kwargs)
		self.service = orders_container.order_item_service

	def post(self, request):
		serializer = OrderItemBulkCreateSerializer(data=request.data)
		if not serializer.is_valid():
			return Response({'error': 'Datos inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

		items_payload = []
		for item in serializer.validated_data['items']:
			items_payload.append({
				'variant_id': item['variant_id'].id,
				'quantity': item['quantity'],
				'status': item.get('status_id'),
			})

		try:
			items = self.service.create_items_for_order(
				order_id=serializer.validated_data['order_id'].id,
				items_payload=items_payload,
			)
		except OrderNotFound as exc:
			return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
		except (
			InvalidOrderItemData,
			OrderItemStockUnavailable,
			OrderItemBusinessUnitMismatch,
			OrderItemStatusDefaultNotConfigured,
			DuplicateOrderItemVariant,
		) as exc:
			return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		return Response(OrderItemSerializer(items, many=True).data, status=status.HTTP_201_CREATED)


class OrderItemDetailAPIView(APIView):
	permission_classes = [IsAuthenticated, HasRole]
	allowed_roles = ['ADMIN', 'MANAGER']

	def __init__(self, **kwargs):
		super().__init__(**kwargs)
		self.service = orders_container.order_item_service

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
			return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
		return Response(OrderItemSerializer(item).data, status=status.HTTP_200_OK)

	def patch(self, request, pk=None):
		serializer = OrderItemUpdateSerializer(data=request.data, partial=True)
		if not serializer.is_valid():
			return Response({'error': 'Datos inválidos', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

		try:
			item = self.service.update_item(
				item_id=self._parse_pk(pk),
				quantity=serializer.validated_data.get('quantity'),
				status=serializer.validated_data.get('status_id'),
			)
		except OrderItemNotFound as exc:
			return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
		except (
			InvalidOrderItemData,
			OrderItemStockUnavailable,
			OrderItemBusinessUnitMismatch,
			DuplicateOrderItemVariant,
		) as exc:
			return Response({'error': str(exc)}, status=status.HTTP_400_BAD_REQUEST)

		return Response(OrderItemSerializer(item).data, status=status.HTTP_200_OK)

	def delete(self, request, pk=None):
		try:
			self.service.delete_item(self._parse_pk(pk))
		except OrderItemNotFound as exc:
			return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
		return Response(status=status.HTTP_204_NO_CONTENT)

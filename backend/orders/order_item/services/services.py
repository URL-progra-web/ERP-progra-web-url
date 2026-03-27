from decimal import Decimal
from typing import Optional

from django.db import transaction

from inventory.uom.models.models import UoM
from inventory.uom_conversion.models.models import UoMConversion
from orders.order.exceptions import OrderNotFound
from orders.order.models.models import Order
from orders.order.repositories.repositories import OrderRepository
from orders.order_item.exceptions import (
	DuplicateOrderItemVariant,
	InvalidOrderItemData,
	OrderItemBusinessUnitMismatch,
	OrderItemNotFound,
	OrderItemStatusDefaultNotConfigured,
	OrderItemStockUnavailable,
)
from orders.order_item.repositories.repositories import OrderItemRepository
from orders.order_status.models.models import OrderStatus
from orders.products.interfaces import IProductService


class OrderItemService:
	def __init__(
		self,
		repository: Optional[OrderItemRepository] = None,
		order_repository: Optional[OrderRepository] = None,
		product_service: Optional[IProductService] = None,
	):
		self.repository = repository or OrderItemRepository()
		self.order_repository = order_repository or OrderRepository()
		self.product_service = product_service

	@staticmethod
	def _get_default_status() -> OrderStatus:
		status = OrderStatus.objects.filter(name__iexact='SOLICITADO').first()
		if status:
			return status
		status = OrderStatus.objects.filter(name__iexact='BORRADOR').first()
		if status:
			return status
		raise OrderItemStatusDefaultNotConfigured(
			'No existe un estado inicial para los items de orden (SOLICITADO o BORRADOR)'
		)

	def _get_order(self, order_id: int) -> Order:
		order = self.order_repository.get_by_id(order_id)
		if not order:
			raise OrderNotFound(f'No se encontró la orden con id {order_id}')
		return order

	@staticmethod
	def _extract_business_unit_id(order: Order) -> Optional[int]:
		first_item = order.items.select_related('variant__product').first()
		if not first_item:
			return None
		return first_item.variant.product.business_unit_id

	def _validate_variant(
		self,
		order: Order,
		variant_id: int,
		quantity: Decimal,
		selected_uom: UoM,
		allow_same_variant_existing: bool = False,
	) -> dict:
		if quantity <= 0:
			raise InvalidOrderItemData('La cantidad debe ser mayor a cero')

		variant_data = self.product_service.get_variant_by_id(variant_id) if self.product_service else None
		if not variant_data:
			raise InvalidOrderItemData(f'No se encontró el variant con id {variant_id}')

		if not variant_data.get('is_active', False):
			raise InvalidOrderItemData(f"El variant {variant_data.get('sku')} está inactivo")

		base_uom_id = variant_data.get('base_uom_id')
		if base_uom_id is None:
			raise InvalidOrderItemData(f"El variant {variant_data.get('sku')} no tiene UOM base configurada")

		if selected_uom.id == base_uom_id:
			conversion_multiplier = Decimal('1')
		else:
			conversion = UoMConversion.objects.filter(from_uom_id=selected_uom.id, to_uom_id=base_uom_id).first()
			if not conversion:
				raise InvalidOrderItemData(
					f"No existe conversión desde {selected_uom.name} hacia {variant_data.get('base_uom')}"
				)
			conversion_multiplier = Decimal(str(conversion.multiplier))

		base_quantity = quantity * conversion_multiplier

		available_stock = Decimal(str(variant_data.get('quantity_available', 0)))

		if available_stock < base_quantity:
			raise OrderItemStockUnavailable(
				f"Stock insuficiente para {variant_data.get('sku')}. Disponible: {available_stock}, solicitado: {base_quantity}"
			)

		existing_item = self.repository.get_by_order_and_variant(order=order, variant_id=variant_id)
		if existing_item and not allow_same_variant_existing:
			raise DuplicateOrderItemVariant(
				f"La orden {order.short_id} ya contiene el variant {variant_data.get('sku')}"
			)

		existing_bu = self._extract_business_unit_id(order)
		variant_bu = variant_data.get('business_unit_id')
		if existing_bu is not None and variant_bu is not None and existing_bu != variant_bu:
			raise OrderItemBusinessUnitMismatch(
				f"No se permiten variantes de distintas unidades de negocio en la misma orden. Esperada {existing_bu}, recibida {variant_bu}."
			)

		variant_data['selected_uom_id'] = selected_uom.id
		variant_data['selected_uom_name'] = selected_uom.name
		variant_data['conversion_multiplier'] = conversion_multiplier
		variant_data['base_quantity'] = base_quantity
		return variant_data

	def list_items(self, order_id: Optional[int] = None):
		return self.repository.list(order_id=order_id)

	def get_item(self, item_id: int):
		item = self.repository.get_by_id(item_id)
		if not item:
			raise OrderItemNotFound(f'No se encontró el item de orden {item_id}')
		return item

	@transaction.atomic
	def create_item(
		self,
		order_id: int,
		variant_id: int,
		quantity: Decimal,
		selected_uom: UoM,
		status: Optional[OrderStatus] = None,
	):
		order = self._get_order(order_id)
		variant_data = self._validate_variant(
			order=order,
			variant_id=variant_id,
			quantity=quantity,
			selected_uom=selected_uom,
		)

		status = status or self._get_default_status()

		return self.repository.create(
			order=order,
			variant_id=variant_id,
			quantity=quantity,
			selected_uom_id=variant_data['selected_uom_id'],
			base_uom_id=variant_data['base_uom_id'],
			conversion_multiplier=variant_data['conversion_multiplier'],
			base_quantity=variant_data['base_quantity'],
			unit_cost=Decimal(str(variant_data.get('cost', 0))),
			unit_price=Decimal(str(variant_data.get('price', 0))),
			status=status,
		)

	@transaction.atomic
	def update_item(
		self,
		item_id: int,
		quantity: Optional[Decimal] = None,
		selected_uom: Optional[UoM] = None,
		status: Optional[OrderStatus] = None,
	):
		item = self.get_item(item_id)
		updates = {}

		resolved_quantity = quantity if quantity is not None else item.quantity
		resolved_uom = selected_uom or item.selected_uom

		if quantity is not None or selected_uom is not None:
			variant_data = self._validate_variant(
				order=item.order,
				variant_id=item.variant_id,
				quantity=resolved_quantity,
				selected_uom=resolved_uom,
				allow_same_variant_existing=True,
			)
			updates['quantity'] = resolved_quantity
			updates['selected_uom'] = resolved_uom
			updates['base_uom_id'] = variant_data['base_uom_id']
			updates['conversion_multiplier'] = variant_data['conversion_multiplier']
			updates['base_quantity'] = variant_data['base_quantity']
			updates['unit_cost'] = Decimal(str(variant_data.get('cost', 0)))
			updates['unit_price'] = Decimal(str(variant_data.get('price', 0)))

		if status is not None:
			updates['status'] = status

		if not updates:
			raise InvalidOrderItemData('No se enviaron campos para actualizar el item')

		return self.repository.update(item, **updates)

	@transaction.atomic
	def delete_item(self, item_id: int) -> None:
		item = self.get_item(item_id)
		self.repository.delete(item)

	@transaction.atomic
	def create_items_for_order(self, order_id: int, items_payload: list[dict]):
		if not items_payload:
			raise InvalidOrderItemData('Debes enviar al menos un item para la orden')

		created_items = []
		for payload in items_payload:
			variant_id = payload.get('variant_id')
			quantity = payload.get('quantity')
			selected_uom = payload.get('selected_uom')
			status = payload.get('status')
			if variant_id is None or quantity is None or selected_uom is None:
				raise InvalidOrderItemData('Cada item debe incluir variant_id, selected_uom y quantity')

			created_items.append(
				self.create_item(
					order_id=order_id,
					variant_id=variant_id,
					quantity=quantity,
					selected_uom=selected_uom,
					status=status,
				)
			)
		return created_items

	def calculate_order_totals(self, order_id: int) -> dict:
		order = self._get_order(order_id)
		return self.repository.calculate_totals_by_order(order)

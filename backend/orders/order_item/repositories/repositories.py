from typing import Optional

from django.db.models import DecimalField, F, QuerySet, Sum

from orders.order.models.models import Order
from orders.order_item.models.models import OrderItem


class OrderItemRepository:
	def list(self, order_id: Optional[int] = None) -> QuerySet:
		qs = OrderItem.objects.select_related('order', 'variant', 'status').order_by('-created_at')
		if order_id is not None:
			qs = qs.filter(order_id=order_id)
		return qs

	def get_by_id(self, item_id: int) -> Optional[OrderItem]:
		return (
			OrderItem.objects.select_related('order', 'variant', 'status')
			.filter(id=item_id)
			.first()
		)

	def get_by_order_and_variant(self, order: Order, variant_id: int) -> Optional[OrderItem]:
		return (
			OrderItem.objects.select_related('order', 'variant', 'status')
			.filter(order=order, variant_id=variant_id)
			.first()
		)

	def create(self, **kwargs) -> OrderItem:
		return OrderItem.objects.create(**kwargs)

	def update(self, item: OrderItem, **kwargs) -> OrderItem:
		for field, value in kwargs.items():
			setattr(item, field, value)
		item.save()
		return item

	def delete(self, item: OrderItem) -> None:
		item.delete()

	def calculate_totals_by_order(self, order: Order) -> dict:
		totals = OrderItem.objects.filter(order=order).aggregate(
			total_quantity=Sum('quantity'),
			total_amount=Sum(
				F('quantity') * F('unit_price'),
				output_field=DecimalField(max_digits=12, decimal_places=2),
			),
		)
		return {
			'total_quantity': totals.get('total_quantity') or 0,
			'total_amount': totals.get('total_amount') or 0,
		}

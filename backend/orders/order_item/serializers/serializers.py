from rest_framework import serializers
from decimal import Decimal

from inventory.uom.models.models import UoM
from orders.order.models.models import Order
from orders.order_item.models.models import OrderItem
from orders.order_status.models.models import OrderStatus
from products.variant.models.models import ProductVariant


class OrderItemSerializer(serializers.ModelSerializer):
	order_short_id = serializers.CharField(source='order.short_id', read_only=True)
	variant_sku = serializers.CharField(source='variant.sku', read_only=True)
	status_name = serializers.CharField(source='status.name', read_only=True)
	selected_uom_name = serializers.CharField(source='selected_uom.name', read_only=True)
	base_uom_name = serializers.CharField(source='base_uom.name', read_only=True)
	line_total = serializers.SerializerMethodField()

	class Meta:
		model = OrderItem
		fields = (
			'id',
			'order',
			'order_short_id',
			'variant',
			'variant_sku',
			'quantity',
			'selected_uom',
			'selected_uom_name',
			'base_uom',
			'base_uom_name',
			'conversion_multiplier',
			'base_quantity',
			'unit_cost',
			'unit_price',
			'line_total',
			'status',
			'status_name',
			'created_at',
		)

	def get_line_total(self, obj):
		return obj.quantity * obj.unit_price


class OrderItemCreateSerializer(serializers.Serializer):
	order_id = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), write_only=True)
	variant_id = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all(), write_only=True)
	selected_uom_id = serializers.PrimaryKeyRelatedField(queryset=UoM.objects.all(), write_only=True)
	quantity = serializers.DecimalField(max_digits=14, decimal_places=4, min_value=Decimal('0.0001'))
	status_id = serializers.PrimaryKeyRelatedField(
		queryset=OrderStatus.objects.all(), required=False, allow_null=True, write_only=True
	)


class OrderItemUpdateSerializer(serializers.Serializer):
	selected_uom_id = serializers.PrimaryKeyRelatedField(queryset=UoM.objects.all(), required=False, write_only=True)
	quantity = serializers.DecimalField(max_digits=14, decimal_places=4, min_value=Decimal('0.0001'), required=False)
	status_id = serializers.PrimaryKeyRelatedField(
		queryset=OrderStatus.objects.all(), required=False, allow_null=False, write_only=True
	)


class OrderItemBulkPayloadSerializer(serializers.Serializer):
	variant_id = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all(), write_only=True)
	selected_uom_id = serializers.PrimaryKeyRelatedField(queryset=UoM.objects.all(), write_only=True)
	quantity = serializers.DecimalField(max_digits=14, decimal_places=4, min_value=Decimal('0.0001'))
	status_id = serializers.PrimaryKeyRelatedField(
		queryset=OrderStatus.objects.all(), required=False, allow_null=True, write_only=True
	)


class OrderItemBulkCreateSerializer(serializers.Serializer):
	order_id = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), write_only=True)
	items = OrderItemBulkPayloadSerializer(many=True)

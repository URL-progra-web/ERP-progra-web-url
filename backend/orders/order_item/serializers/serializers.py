from rest_framework import serializers

from orders.order.models.models import Order
from orders.order_item.models.models import OrderItem
from orders.order_status.models.models import OrderStatus
from products.variant.models.models import ProductVariant


class OrderItemSerializer(serializers.ModelSerializer):
	order_short_id = serializers.CharField(source='order.short_id', read_only=True)
	variant_sku = serializers.CharField(source='variant.sku', read_only=True)
	status_name = serializers.CharField(source='status.name', read_only=True)
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
	quantity = serializers.IntegerField(min_value=1)
	status_id = serializers.PrimaryKeyRelatedField(
		queryset=OrderStatus.objects.all(), required=False, allow_null=True, write_only=True
	)


class OrderItemUpdateSerializer(serializers.Serializer):
	quantity = serializers.IntegerField(min_value=1, required=False)
	status_id = serializers.PrimaryKeyRelatedField(
		queryset=OrderStatus.objects.all(), required=False, allow_null=False, write_only=True
	)


class OrderItemBulkPayloadSerializer(serializers.Serializer):
	variant_id = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all(), write_only=True)
	quantity = serializers.IntegerField(min_value=1)
	status_id = serializers.PrimaryKeyRelatedField(
		queryset=OrderStatus.objects.all(), required=False, allow_null=True, write_only=True
	)


class OrderItemBulkCreateSerializer(serializers.Serializer):
	order_id = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all(), write_only=True)
	items = OrderItemBulkPayloadSerializer(many=True)

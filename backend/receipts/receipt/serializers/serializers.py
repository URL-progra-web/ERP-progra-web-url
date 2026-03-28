from rest_framework import serializers
from receipts.receipt.models.models import Receipt


class OrderItemLineSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    variant_sku = serializers.CharField(source='variant.sku')
    quantity = serializers.DecimalField(max_digits=14, decimal_places=4)
    selected_uom_name = serializers.CharField(source='selected_uom.name')
    unit_price = serializers.DecimalField(max_digits=10, decimal_places=2)
    line_total = serializers.SerializerMethodField()

    def get_line_total(self, obj):
        return obj.quantity * obj.unit_price


class ReceiptCustomerSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField(allow_null=True)
    address = serializers.CharField(allow_null=True)
    customer_type = serializers.CharField()


class ReceiptSerializer(serializers.ModelSerializer):
    issued_by_name = serializers.CharField(source='issued_by.name', read_only=True)
    order_short_id = serializers.CharField(source='order.short_id', read_only=True)
    order_status = serializers.CharField(source='order.status.name', read_only=True)
    customer = ReceiptCustomerSerializer(source='order.customer', read_only=True)
    payment_method_name = serializers.CharField(
        source='order.payment_method.name', read_only=True, default=None
    )
    items = OrderItemLineSerializer(source='order.items', many=True, read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id',
            'receipt_number',
            'issued_by',
            'issued_by_name',
            'order',
            'order_short_id',
            'order_status',
            'customer',
            'payment_method_name',
            'items',
            'subtotal',
            'shipping_total',
            'discount_total',
            'grand_total',
            'notes',
            'issued_at',
        ]
        read_only_fields = ['id', 'issued_at', 'receipt_number']
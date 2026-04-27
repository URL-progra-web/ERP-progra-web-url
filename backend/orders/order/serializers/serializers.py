from django.db.models import DecimalField, F, Sum
from rest_framework import serializers
from decimal import Decimal

from crm.customer.models.models import Customer
from inventory.uom.models.models import UoM
from orders.order.models.models import Order
from orders.order_status.models.models import OrderStatus
from orders.payment_method.models.models import PaymentMethod
from products.variant.models.models import ProductVariant

class OrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_email = serializers.EmailField(source='customer.email', read_only=True, allow_null=True)
    customer_address = serializers.CharField(source='customer.address', read_only=True, allow_null=True)
    customer_type = serializers.CharField(source='customer.customer_type', read_only=True)
    customer_type_label = serializers.SerializerMethodField()
    payment_method_name = serializers.CharField(source='payment_method.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    total_quantity = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'short_id',
            'customer',
            'customer_name',
            'customer_phone',
            'customer_email',
            'customer_address',
            'customer_type',
            'customer_type_label',
            'payment_method',
            'payment_method_name',
            'status',
            'status_name',
            'shipping_address',
            'shipping_cost',
            'notes',
            'created_at',
            'updated_at',
            'total_quantity',
            'total_amount',
        )

    def get_total_quantity(self, obj):
        return obj.items.aggregate(total=Sum('base_quantity')).get('total') or 0

    def get_total_amount(self, obj):
        total = obj.items.aggregate(
            total=Sum(
                F('quantity') * F('unit_price'),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        ).get('total')
        return total or 0

    def get_customer_type_label(self, obj):
        if not obj.customer_id:
            return ''
        return obj.customer.get_customer_type_display()

class OrderCreateSerializer(serializers.Serializer):
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), required=True, write_only=True
    )
    payment_method_id = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMethod.objects.all(), required=False, allow_null=True, write_only=True
    )
    status_id = serializers.PrimaryKeyRelatedField(
        queryset=OrderStatus.objects.all(), required=False, allow_null=True, write_only=True
    )
    shipping_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    
    class ItemSerializer(serializers.Serializer):
        variant_id = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all(), write_only=True)
        selected_uom_id = serializers.PrimaryKeyRelatedField(queryset=UoM.objects.all(), write_only=True)
        quantity = serializers.DecimalField(max_digits=14, decimal_places=4, min_value=Decimal('0.0001'))
        status_id = serializers.PrimaryKeyRelatedField(
            queryset=OrderStatus.objects.all(), required=False, allow_null=True, write_only=True
        )

    items = ItemSerializer(many=True, required=False)


class OrderUpdateSerializer(serializers.Serializer):
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), required=False, allow_null=False, write_only=True
    )
    payment_method_id = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMethod.objects.all(), required=False, allow_null=True, write_only=True
    )
    status_id = serializers.PrimaryKeyRelatedField(
        queryset=OrderStatus.objects.all(), required=False, allow_null=False, write_only=True
    )
    shipping_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class CustomerLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('id', 'name')


class PaymentMethodLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ('id', 'name')

from rest_framework import serializers

from crm.customer.models.models import Customer
from orders.order.models.models import Order
from orders.order_status.models.models import OrderStatus
from orders.payment_method.models.models import PaymentMethod

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'

class OrderCreateSerializer(serializers.Serializer):
    short_id = serializers.CharField(max_length=20, required=False, allow_blank=True)
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


class CustomerLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('id', 'name')


class PaymentMethodLookupSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ('id', 'name')

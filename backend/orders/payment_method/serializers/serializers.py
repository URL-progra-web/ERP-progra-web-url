from rest_framework import serializers

from orders.payment_method.models.models import PaymentMethod


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ('id', 'name', 'is_active', 'is_protected')


class PaymentMethodWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=100, required=True)
    is_active = serializers.BooleanField(default=True)


class PaymentMethodStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=True)

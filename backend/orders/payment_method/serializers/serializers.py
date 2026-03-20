from rest_framework import serializers

from orders.payment_method.models.models import PaymentMethod


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ('id', 'name', 'is_active')


class PaymentMethodStatusSerializer(serializers.Serializer):
    is_active = serializers.BooleanField(required=True)

from rest_framework import serializers

from orders.order_status.models.models import OrderStatus


class OrderStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderStatus
        fields = ('id', 'name', 'description')


class OrderStatusWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=50, required=True)
    description = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_name(self, value: str) -> str:
        normalized = value.strip().upper()
        if not normalized:
            raise serializers.ValidationError('El nombre no puede estar vacío.')
        return normalized


class OrderStatusTransitionSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(min_value=1)
    target_status = serializers.CharField(max_length=50)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate_target_status(self, value: str) -> str:
        normalized = value.strip().upper()
        if not normalized:
            raise serializers.ValidationError('El estado de destino no puede estar vacío.')
        return normalized

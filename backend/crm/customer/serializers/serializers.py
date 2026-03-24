from rest_framework import serializers

from crm.customer.models.models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ('id', 'name', 'phone', 'email', 'address', 'customer_type', 'created_at')


class CustomerWriteSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255, required=True)
    phone = serializers.CharField(max_length=50, required=True)
    email = serializers.EmailField(max_length=255, required=False, allow_null=True, allow_blank=True)
    address = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    customer_type = serializers.ChoiceField(choices=['RETAIL', 'WHOLESALE'], default='RETAIL')

    def validate_name(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError('El nombre no puede estar vacío.')
        return normalized

    def validate_phone(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError('El teléfono no puede estar vacío.')
        return normalized

from rest_framework import serializers

from crm.entrepreneur.models.models import Entrepreneur
from users.user.models.models import User


class UserSerializer(serializers.ModelSerializer):
    """Serializer para mostrar datos básicos del usuario asignado."""

    class Meta:
        model = User
        fields = ('id', 'name', 'email')


class EntrepreneurSerializer(serializers.ModelSerializer):
    """Serializer de lectura con relación anidada del usuario."""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Entrepreneur
        fields = ('id', 'user', 'company_name', 'contact_name', 'phone', 'email', 'created_at')


class EntrepreneurWriteSerializer(serializers.Serializer):
    """Serializer para crear y actualizar entrepreneurs."""
    company_name = serializers.CharField(max_length=255, required=True)
    contact_name = serializers.CharField(max_length=255, required=True)
    phone = serializers.CharField(max_length=50, required=False, allow_null=True, allow_blank=True)
    email = serializers.EmailField(max_length=255, required=False, allow_null=True, allow_blank=True)
    user_id = serializers.IntegerField(required=False, allow_null=True)

    def validate_company_name(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError('El nombre de la empresa no puede estar vacío.')
        return normalized

    def validate_contact_name(self, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise serializers.ValidationError('El nombre del contacto no puede estar vacío.')
        return normalized

    def validate_phone(self, value: str) -> str:
        if value:
            normalized = value.strip()
            return normalized if normalized else None
        return None

    def validate_email(self, value: str) -> str:
        if value:
            normalized = value.strip().lower()
            return normalized if normalized else None
        return None

    def validate_user_id(self, value: int) -> int:
        if value:
            if not User.objects.filter(id=value).exists():
                raise serializers.ValidationError(f'No se encontró el usuario con ID {value}.')
            return value
        return None

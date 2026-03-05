from rest_framework import serializers
from apps.users.user.models.user_model import User
from django.contrib.auth.models import Group

class GroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = Group
        fields = ['id', 'name']

class UserReadSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'first_name', 
            'last_name', 
            'phone', 
            'is_active', 
            'is_staff', 
            'is_superuser',
            'groups'
        ]
        
class UserWriteSerializer(serializers.ModelSerializer):
    # Usamos PrimaryKeyRelatedField para poder recibir una lista de IDs [1, 2] en el POST/PATCH
    groups = serializers.PrimaryKeyRelatedField(
        many=True, 
        queryset=Group.objects.all(), 
        required=False
    )
    
    class Meta:
        model = User
        fields = [
            'email',
            'password',
            'first_name', 
            'last_name', 
            'phone', 
            'is_active', 
            'is_staff', 
            'is_superuser',
            'groups'
        ]
        # Hacemos que password sea write_only para mayor seguridad (aunque usemos UserReadSerializer para devolver datos)
        extra_kwargs = {
            'password': {'write_only': True},
            'email': {'required': True}
        }


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer para el endpoint /me/ - Devuelve datos del usuario autenticado.
    """
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone',
            'is_active',
            'is_staff',
            'is_superuser',
            'date_joined',
        ]
        read_only_fields = fields


class LoginSerializer(serializers.Serializer):
    """
    Serializer para validar credenciales de login.
    No está ligado a un modelo, solo valida email y password.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError("Email y password son requeridos.")

        return attrs

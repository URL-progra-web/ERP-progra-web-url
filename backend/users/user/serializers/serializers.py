from rest_framework import serializers
from users.user.models.models import User
from users.role.serializers.serializers import RoleSerializer
from users.role.models.models import Role

class UserSerializer(serializers.ModelSerializer):
    role = RoleSerializer(read_only=True)
    role_id = serializers.PrimaryKeyRelatedField(
        queryset=Role.objects.all(), source='role', write_only=True
    )

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role', 'role_id', 'is_active', 'created_at', 'updated_at']
        extra_kwargs = {
            'password_hash': {'write_only': True}
        }

class UserCreateSerializer(serializers.ModelSerializer):
    role_id = serializers.IntegerField(write_only=True)
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'role_id', 'password']

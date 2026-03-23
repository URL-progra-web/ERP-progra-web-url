from rest_framework import serializers
from products.color.models.models import Color


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = [
            'id',
            'name',
            'hex_code',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
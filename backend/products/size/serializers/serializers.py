from rest_framework import serializers
from products.size.models.models import Size


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = [
            'id',
            'name',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
from rest_framework import serializers
from products.size.models.models import Size


class SizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = [
            'id',
            'name',
        ]
        read_only_fields = ['id']
from rest_framework import serializers
from inventory.uom.models.models import UoM
from inventory.uom_conversion.models.models import UoMConversion


class UomSerializer(serializers.ModelSerializer):
    class Meta:
        model = UoM
        fields = ['id', 'code', 'name']


class UomConversionSerializer(serializers.ModelSerializer):
    # Nested read-only fields for display
    from_uom_code = serializers.CharField(source='from_uom.code', read_only=True)
    from_uom_name = serializers.CharField(source='from_uom.name', read_only=True)
    to_uom_code = serializers.CharField(source='to_uom.code', read_only=True)
    to_uom_name = serializers.CharField(source='to_uom.name', read_only=True)

    class Meta:
        model = UoMConversion
        fields = [
            'id',
            'from_uom_id',
            'from_uom_code',
            'from_uom_name',
            'to_uom_id',
            'to_uom_code',
            'to_uom_name',
            'multiplier',
        ]

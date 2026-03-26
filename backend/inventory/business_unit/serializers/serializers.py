from rest_framework import serializers
from inventory.business_unit.models.models import BusinessUnit


class BusinessUnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessUnit
        fields = ['id', 'name', 'description']

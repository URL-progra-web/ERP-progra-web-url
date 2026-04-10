from rest_framework import serializers
from inventory.transaction_type.models.models import TransactionType

class TransactionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ['name', 'factor', 'description']

class TransactionTypeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionType
        fields = ['name', 'factor', 'description']

from rest_framework import serializers
from inventory.transaction.models.models import InventoryTransaction
from products.variant.models.models import ProductVariant
from users.user.models.models import User
from inventory.transaction_type.models.models import TransactionType
from inventory.transaction_type.serializers.serializers import TransactionTypeSerializer

class InventoryTransactionSerializer(serializers.ModelSerializer):
    transaction_type = TransactionTypeSerializer(read_only=True)
    variant_sku = serializers.CharField(source='variant.sku', read_only=True)
    selected_uom_name = serializers.CharField(source='selected_uom.name', read_only=True)
    base_uom_name = serializers.CharField(source='base_uom.name', read_only=True)
    
    class Meta:
        model = InventoryTransaction
        fields = ['id', 'variant', 'variant_sku', 'user', 'transaction_type',
                  'selected_uom', 'selected_uom_name', 'base_uom', 'base_uom_name',
                  'quantity', 'conversion_multiplier', 'base_quantity', 'reference', 'notes', 'created_at']

class InventoryTransactionCreateSerializer(serializers.ModelSerializer):
    variant_id = serializers.IntegerField(write_only=True)
    selected_uom_id = serializers.IntegerField(write_only=True)
    transaction_type_name = serializers.CharField(write_only=True, max_length=50)
    
    class Meta:
        model = InventoryTransaction
        fields = ['variant_id', 'selected_uom_id', 'transaction_type_name', 'quantity', 'reference', 'notes']

from rest_framework import serializers
from receipts.receipt_adjustment.models.models import ReceiptAdjustment


class ReceiptAdjustmentSerializer(serializers.ModelSerializer):
    receipt_number = serializers.CharField(source='receipt.receipt_number', read_only=True)

    class Meta:
        model = ReceiptAdjustment
        fields = [
            'id',
            'receipt',
            'receipt_number',
            'adjustment_type',
            'reason',
            'amount',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
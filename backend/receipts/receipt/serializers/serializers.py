from rest_framework import serializers
from orders.receipt.models.models import Receipt


class ReceiptSerializer(serializers.ModelSerializer):
    issued_by_name = serializers.CharField(source='issued_by.name', read_only=True)

    class Meta:
        model = Receipt
        fields = [
            'id',
            'receipt_number',
            'issued_by',
            'issued_by_name',
            'order',
            'subtotal',
            'shipping_total',
            'discount_total',
            'grand_total',
            'notes',
            'issued_at',
        ]
        read_only_fields = ['id', 'issued_at', 'receipt_number']
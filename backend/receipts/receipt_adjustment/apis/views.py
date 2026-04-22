from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from receipts.receipt_adjustment.services.services import ReceiptAdjustmentService
from receipts.receipt_adjustment.serializers.serializers import ReceiptAdjustmentSerializer


class ReceiptAdjustmentViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ReceiptAdjustmentService()

    def list(self, request, receipt_pk=None):
        adjustments = self.service.list_by_receipt(receipt_pk)
        serializer = ReceiptAdjustmentSerializer(adjustments, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None, receipt_pk=None):
        adjustment = self.service.get_by_id(pk)
        if not adjustment:
            return Response(
                {'detail': 'Ajuste no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ReceiptAdjustmentSerializer(adjustment)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request, receipt_pk=None):
        adjustment_type = request.data.get('adjustment_type')
        reason = request.data.get('reason')
        amount = request.data.get('amount')

        if not all([adjustment_type, reason, amount]):
            return Response(
                {'detail': 'adjustment_type, reason y amount son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            adjustment = self.service.create(receipt_pk, adjustment_type, reason, amount)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        serializer = ReceiptAdjustmentSerializer(adjustment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
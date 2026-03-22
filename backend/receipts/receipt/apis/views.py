from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from receipts.receipt.serializers.serializers import ReceiptSerializer
from receipts.receipt.services.services import ReceiptService


class ReceiptViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ReceiptService()

    def list(self, request):
        receipts = self.service.list()
        serializer = ReceiptSerializer(receipts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        receipt = self.service.get_by_id(pk)
        if not receipt:
            return Response({'detail': 'Recibo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-order/(?P<order_id>[^/.]+)')
    def by_order(self, request, order_id=None):
        receipt = self.service.get_by_order(order_id)
        if not receipt:
            return Response({'detail': 'No existe recibo para esta orden.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)
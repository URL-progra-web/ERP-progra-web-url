import math
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from receipts.receipt.serializers.serializers import ReceiptSerializer
from receipts.receipt.services.services import ReceiptService

PAGE_SIZE = 10


class ReceiptViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = ReceiptService()

    def list(self, request):
        qs = self.service.list()

        after = request.query_params.get('issued_at_after')
        before = request.query_params.get('issued_at_before')
        if after:
            qs = qs.filter(issued_at__date__gte=after)
        if before:
            qs = qs.filter(issued_at__date__lte=before)

        count = qs.count()
        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = int(request.query_params.get('page_size', PAGE_SIZE))
        except ValueError:
            page, page_size = 1, PAGE_SIZE

        start = (page - 1) * page_size
        serializer = ReceiptSerializer(qs[start:start + page_size], many=True)
        return Response({
            'count': count,
            'num_pages': math.ceil(count / page_size) if count else 1,
            'results': serializer.data,
        }, status=status.HTTP_200_OK)

    def retrieve(self, request, pk=None):
        receipt = self.service.get_by_id(pk)
        if not receipt:
            return Response({'detail': 'Recibo no encontrado.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):
        order_id = request.data.get('order_id')
        if not order_id:
            return Response({'detail': 'Se requiere order_id.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            receipt = self.service.create_from_order(order_id, issued_by=request.user)
        except ValueError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='by-order/(?P<order_id>[^/.]+)')
    def by_order(self, request, order_id=None):
        receipt = self.service.get_by_order(order_id)
        if not receipt:
            return Response({'detail': 'No existe recibo para esta orden.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = ReceiptSerializer(receipt)
        return Response(serializer.data, status=status.HTTP_200_OK)
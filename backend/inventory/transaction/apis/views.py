from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import HasRole
from core.mixins import PaginationMixin
from inventory.transaction.serializers.serializers import InventoryTransactionSerializer, InventoryTransactionCreateSerializer
from inventory.transaction.services.services import InventoryTransactionService

class InventoryTransactionViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = InventoryTransactionService()

    def list(self, request):
        variant_id = request.query_params.get('variant_id')
        transaction_type_name = request.query_params.get('transaction_type')
        
        qs = self.service.list_transactions_filtered(
            variant_id=int(variant_id) if variant_id else None,
            transaction_type_name=transaction_type_name
        )
        return self.paginate_queryset(qs, InventoryTransactionSerializer, request)

    def retrieve(self, request, pk=None):
        transaction = self.service.get_transaction(pk)
        if not transaction:
            return Response({'error': 'Transacción no encontrada'}, status=status.HTTP_404_NOT_FOUND)
        serializer = InventoryTransactionSerializer(transaction)
        return Response(serializer.data)

    def create(self, request):
        serializer = InventoryTransactionCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                transaction = self.service.create_transaction(
                    variant_id=serializer.validated_data['variant_id'],
                    transaction_type_name=serializer.validated_data['transaction_type_name'],
                    quantity=serializer.validated_data['quantity'],
                    user=request.user if request.user.is_authenticated else None,
                    reference=serializer.validated_data.get('reference'),
                    notes=serializer.validated_data.get('notes')
                )
                return Response(InventoryTransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            self.service.delete_transaction(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

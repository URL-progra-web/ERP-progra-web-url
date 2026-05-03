from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.permissions import HasRole
from core.mixins import PaginationMixin
from inventory.transaction_type.serializers.serializers import TransactionTypeSerializer, TransactionTypeCreateSerializer
from inventory.transaction_type.services.services import TransactionTypeService

class TransactionTypeViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = TransactionTypeService()

    def list(self, request):
        transaction_types = self.service.list_transaction_types()
        return self.paginate_queryset(transaction_types, TransactionTypeSerializer, request)

    def retrieve(self, request, pk=None):
        transaction_type = self.service.get_transaction_type(pk)
        if not transaction_type:
            return Response({'error': 'Tipo de transacción no encontrado'}, status=status.HTTP_404_NOT_FOUND)
        serializer = TransactionTypeSerializer(transaction_type)
        return Response(serializer.data)

    def create(self, request):
        serializer = TransactionTypeCreateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                transaction_type = self.service.create_transaction_type(**serializer.validated_data)
                return Response(TransactionTypeSerializer(transaction_type).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        factor = request.data.get('factor')
        description = request.data.get('description')
        try:
            transaction_type = self.service.update_transaction_type(
                name=pk,
                factor=int(factor) if factor else None,
                description=description
            )
            return Response(TransactionTypeSerializer(transaction_type).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            self.service.delete_transaction_type(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

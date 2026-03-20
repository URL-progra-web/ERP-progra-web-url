from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.mixins import PaginationMixin
from inventory.container import inventory_container
from inventory.uom.serializers.serializers import UomConversionSerializer
from users.permissions import HasRole


class UomConversionViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = inventory_container.uom_conversion_service

    def list(self, request):
        from_uom_id = request.query_params.get('from_uom_id') or None
        to_uom_id = request.query_params.get('to_uom_id') or None
        conversions = self.service.list_conversions(
            from_uom_id=int(from_uom_id) if from_uom_id else None,
            to_uom_id=int(to_uom_id) if to_uom_id else None,
        )
        return self.paginate_queryset(conversions, UomConversionSerializer, request)

    def retrieve(self, request, pk=None):
        conversion = self.service.get_conversion(pk)
        if not conversion:
            return Response({'error': 'Conversión no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UomConversionSerializer(conversion).data)

    def create(self, request):
        serializer = UomConversionSerializer(data=request.data)
        if serializer.is_valid():
            try:
                conversion = self.service.create_conversion(
                    from_uom_id=request.data.get('from_uom_id'),
                    to_uom_id=request.data.get('to_uom_id'),
                    multiplier=serializer.validated_data['multiplier'],
                )
                return Response(
                    UomConversionSerializer(conversion).data,
                    status=status.HTTP_201_CREATED
                )
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        from_uom_id = request.data.get('from_uom_id')
        to_uom_id = request.data.get('to_uom_id')
        multiplier = request.data.get('multiplier')
        if not from_uom_id or not to_uom_id or multiplier is None:
            return Response(
                {'error': 'Los campos from_uom_id, to_uom_id y multiplier son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        try:
            conversion = self.service.update_conversion(
                conversion_id=pk,
                from_uom_id=from_uom_id,
                to_uom_id=to_uom_id,
                multiplier=multiplier,
            )
            return Response(UomConversionSerializer(conversion).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            self.service.delete_conversion(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

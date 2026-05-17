from django.db import IntegrityError
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.mixins import PaginationMixin
from inventory.container import inventory_container
from inventory.uom.serializers.serializers import UomSerializer
from users.permissions import HasRole


class UomViewSet(viewsets.ViewSet, PaginationMixin):
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN']

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = inventory_container.uom_service

    def list(self, request):
        uoms = self.service.list_uoms()
        return self.paginate_queryset(uoms, UomSerializer, request)

    def retrieve(self, request, pk=None):
        uom = self.service.get_uom(pk)
        if not uom:
            return Response({'error': 'UOM no encontrada.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(UomSerializer(uom).data)

    def create(self, request):
        serializer = UomSerializer(data=request.data)
        if serializer.is_valid():
            try:
                uom = self.service.create_uom(**serializer.validated_data)
                return Response(UomSerializer(uom).data, status=status.HTTP_201_CREATED)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        code = request.data.get('code')
        name = request.data.get('name')
        if not code or not name:
            return Response({'error': 'Los campos code y name son requeridos.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            uom = self.service.update_uom(pk, code=code, name=name)
            return Response(UomSerializer(uom).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, pk=None):
        try:
            self.service.delete_uom(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_409_CONFLICT)
        except IntegrityError:
            return Response(
                {'error': 'No se puede eliminar la UOM porque está referenciada por otros registros.'},
                status=status.HTTP_409_CONFLICT,
            )

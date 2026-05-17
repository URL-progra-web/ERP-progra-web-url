from django.db.models.deletion import RestrictedError
from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from inventory.business_unit.models.models import BusinessUnit
from inventory.business_unit.serializers.serializers import BusinessUnitSerializer


class BusinessUnitViewSet(ModelViewSet):
    queryset = BusinessUnit.objects.all().order_by('name')
    serializer_class = BusinessUnitSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {'error': 'No se puede eliminar la sede porque está referenciada por productos u otros registros.'},
                status=status.HTTP_409_CONFLICT,
            )

from rest_framework.filters import SearchFilter
from rest_framework.viewsets import ModelViewSet
from inventory.business_unit.models.models import BusinessUnit
from inventory.business_unit.serializers.serializers import BusinessUnitSerializer


class BusinessUnitViewSet(ModelViewSet):
    queryset = BusinessUnit.objects.all().order_by('name')
    serializer_class = BusinessUnitSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

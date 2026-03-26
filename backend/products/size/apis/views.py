from rest_framework.filters import SearchFilter
from rest_framework.viewsets import ModelViewSet
from products.size.models.models import Size
from products.size.serializers.serializers import SizeSerializer


class SizeViewSet(ModelViewSet):
    queryset = Size.objects.all().order_by('-id')
    serializer_class = SizeSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

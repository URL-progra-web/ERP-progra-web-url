from django.db.models.deletion import RestrictedError
from rest_framework.filters import SearchFilter
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from products.product.models.models import Product
from products.product.serializers.serializers import ProductSerializer


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    filterset_fields = {
        'category': ['exact'],
        'entrepreneur': ['exact'],
        'business_unit': ['exact'],
        'base_uom': ['exact'],
    }

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {'error': 'No se puede eliminar el producto porque tiene variantes o está referenciado por otros registros.'},
                status=status.HTTP_409_CONFLICT,
            )

from rest_framework.filters import SearchFilter
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from products.variant.models.models import ProductVariant
from products.variant.serializers.serializers import ProductVariantSerializer


class ProductVariantViewSet(ModelViewSet):
    queryset = ProductVariant.objects.all().order_by('-id')
    serializer_class = ProductVariantSerializer
    filter_backends = [SearchFilter, DjangoFilterBackend]
    search_fields = ['sku', 'product__name']
    filterset_fields = {
        'is_active': ['exact'],
    }

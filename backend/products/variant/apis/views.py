from rest_framework.viewsets import ModelViewSet
from products.variant.models.models import ProductVariant
from products.variant.serializers.serializers import ProductVariantSerializer


class ProductVariantViewSet(ModelViewSet):
    queryset = ProductVariant.objects.all().order_by('-id')
    serializer_class = ProductVariantSerializer
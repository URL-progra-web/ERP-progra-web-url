from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from products.variant.models.models import ProductVariant
from products.variant.serializers.serializers import ProductVariantSerializer


class ProductVariantViewSet(ModelViewSet):
    serializer_class = ProductVariantSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = ProductVariant.objects.select_related(
            'product',
            'size',
            'color',
            'uom',
        ).order_by('-id')

        search = self.request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(
                Q(sku__icontains=search) |
                Q(product__name__icontains=search) |
                Q(size__name__icontains=search) |
                Q(color__name__icontains=search)
            )

        is_active = self.request.query_params.get('is_active')
        if is_active == 'true':
            queryset = queryset.filter(is_active=True)
        elif is_active == 'false':
            queryset = queryset.filter(is_active=False)

        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)

        return queryset

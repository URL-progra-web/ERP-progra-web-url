from rest_framework.viewsets import ModelViewSet
from products.product.models.models import Product
from products.product.serializers.serializers import ProductSerializer


class ProductViewSet(ModelViewSet):
    queryset = Product.objects.all().order_by('-id')
    serializer_class = ProductSerializer
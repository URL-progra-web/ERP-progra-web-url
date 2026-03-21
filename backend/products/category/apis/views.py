from rest_framework.viewsets import ModelViewSet
from products.category.models.models import Category
from products.category.serializers.serializers import CategorySerializer


class CategoryViewSet(ModelViewSet):
    queryset = Category.objects.all().order_by('-id')
    serializer_class = CategorySerializer
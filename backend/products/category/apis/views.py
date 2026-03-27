from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from products.category.models.models import Category
from products.category.serializers.serializers import CategorySerializer


class CategoryViewSet(ModelViewSet):
    serializer_class = CategorySerializer

    def get_queryset(self):
        queryset = Category.objects.all().order_by('-id')
        params = self.request.query_params

        search = params.get('search')
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(parent__name__icontains=search))

        is_leaf = params.get('is_leaf')
        if is_leaf is not None and is_leaf != '':
            truthy = {'1', 'true', 't', 'yes', 'y'}
            falsy = {'0', 'false', 'f', 'no', 'n'}
            value = is_leaf.lower()
            if value in truthy:
                queryset = queryset.filter(is_leaf=True)
            elif value in falsy:
                queryset = queryset.filter(is_leaf=False)

        parent = params.get('parent')
        if parent not in (None, ''):
            try:
                parent_id = int(parent)
            except (TypeError, ValueError):
                return queryset.none()
            queryset = queryset.filter(parent_id=parent_id)

        return queryset

from django.db.models import Q
from django.db.models.deletion import RestrictedError
from rest_framework import status
from rest_framework.viewsets import ModelViewSet
from rest_framework.response import Response
from products.category.models.models import Category
from products.product.models.models import Product
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

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.subcategories.exists():
            return Response(
                {'error': 'No puedes eliminar una categoría que tiene subcategorías.'},
                status=status.HTTP_409_CONFLICT,
            )
        if Product.objects.filter(category=instance).exists():
            return Response(
                {'error': 'No puedes eliminar una categoría que está asignada a uno o más productos.'},
                status=status.HTTP_409_CONFLICT,
            )
        try:
            return super().destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {'error': 'No se puede eliminar la categoría porque está referenciada por otros registros.'},
                status=status.HTTP_409_CONFLICT,
            )

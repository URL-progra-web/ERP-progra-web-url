from django.db.models.deletion import RestrictedError
from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from products.size.models.models import Size
from products.size.serializers.serializers import SizeSerializer
from products.variant.models.models import ProductVariant


class SizeViewSet(ModelViewSet):
    queryset = Size.objects.all().order_by('-id')
    serializer_class = SizeSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if ProductVariant.objects.filter(size=instance).exists():
            return Response(
                {'error': 'No puedes eliminar una talla que ya está asignada a una o más variantes.'},
                status=status.HTTP_409_CONFLICT,
            )
        try:
            return super().destroy(request, *args, **kwargs)
        except RestrictedError:
            return Response(
                {'error': 'No se puede eliminar la talla porque está referenciada por otros registros.'},
                status=status.HTTP_409_CONFLICT,
            )

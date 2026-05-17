from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from products.color.models.models import Color
from products.color.serializers.serializers import ColorSerializer


class ColorViewSet(ModelViewSet):
    queryset = Color.objects.all().order_by('-id')
    serializer_class = ColorSerializer
    filter_backends = [SearchFilter]
    search_fields = ['name']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.productvariant_set.exists():
            return Response(
                {'error': 'No puedes eliminar un color que ya está asignado a una o más variantes.'},
                status=status.HTTP_409_CONFLICT,
            )
        return super().destroy(request, *args, **kwargs)

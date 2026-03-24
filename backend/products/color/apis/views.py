from rest_framework.viewsets import ModelViewSet
from products.color.models.models import Color
from products.color.serializers.serializers import ColorSerializer


class ColorViewSet(ModelViewSet):
    queryset = Color.objects.all().order_by('-id')
    serializer_class = ColorSerializer
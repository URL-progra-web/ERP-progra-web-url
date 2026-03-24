from django.db.models import Q
from rest_framework.viewsets import ModelViewSet
from orders.order.models.models import Order
from products.variant.models.models import ProductVariant
from products.variant.serializers.serializers import ProductVariantSerializer


class ProductVariantViewSet(ModelViewSet):
    serializer_class = ProductVariantSerializer

    @staticmethod
    def _parse_bool(value):
        if value is None or value == '':
            return None

        truthy = {'1', 'true', 't', 'yes', 'y'}
        falsy = {'0', 'false', 'f', 'no', 'n'}
        normalized = str(value).strip().lower()
        if normalized in truthy:
            return True
        if normalized in falsy:
            return False
        return None

    def get_queryset(self):
        queryset = ProductVariant.objects.select_related(
            'product',
            'product__business_unit',
            'size',
            'color',
            'uom',
        ).order_by('-id')
        params = self.request.query_params

        search = params.get('search')
        if search:
            queryset = queryset.filter(
                Q(sku__icontains=search)
                | Q(product__name__icontains=search)
                | Q(size__name__icontains=search)
                | Q(color__name__icontains=search)
            )

        is_active = self._parse_bool(params.get('is_active'))
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active)

        in_stock = self._parse_bool(params.get('in_stock'))
        if in_stock is True:
            queryset = queryset.filter(quantity_available__gt=0)
        elif in_stock is False:
            queryset = queryset.filter(quantity_available__lte=0)

        product = params.get('product')
        if product not in (None, ''):
            try:
                queryset = queryset.filter(product_id=int(product))
            except (TypeError, ValueError):
                return queryset.none()

        business_unit = params.get('business_unit')
        if business_unit not in (None, ''):
            try:
                queryset = queryset.filter(product__business_unit_id=int(business_unit))
            except (TypeError, ValueError):
                return queryset.none()

        order_id = params.get('order_id')
        if order_id not in (None, ''):
            try:
                parsed_order_id = int(order_id)
            except (TypeError, ValueError):
                return queryset.none()

            order = Order.objects.filter(id=parsed_order_id).first()
            if not order:
                return queryset.none()

            first_item = order.items.select_related('variant__product').first()
            if first_item:
                queryset = queryset.filter(product__business_unit_id=first_item.variant.product.business_unit_id)

        return queryset

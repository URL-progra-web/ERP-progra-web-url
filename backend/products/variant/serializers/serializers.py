from rest_framework import serializers
from products.variant.models.models import ProductVariant


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    entrepreneur = serializers.IntegerField(source='product.entrepreneur_id', read_only=True)
    entrepreneur_name = serializers.CharField(source='product.entrepreneur.company_name', read_only=True)
    business_unit = serializers.IntegerField(source='product.business_unit_id', read_only=True)
    business_unit_name = serializers.CharField(source='product.business_unit.name', read_only=True)
    size_name = serializers.CharField(source='size.name', read_only=True)
    color_name = serializers.CharField(source='color.name', read_only=True)
    uom_name = serializers.CharField(source='uom.name', read_only=True)

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',
            'product_name',
            'entrepreneur',
            'entrepreneur_name',
            'business_unit',
            'business_unit_name',
            'sku',
            'size',
            'size_name',
            'color',
            'color_name',
            'uom',
            'uom_name',
            'cost',
            'price',
            'quantity_available',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_cost(self, value):
        if value < 0:
            raise serializers.ValidationError("El costo no puede ser negativo.")
        return value

    def validate_price(self, value):
        if value < 0:
            raise serializers.ValidationError("El precio no puede ser negativo.")
        return value

    def validate_quantity_available(self, value):
        if value < 0:
            raise serializers.ValidationError("La cantidad disponible no puede ser negativa.")
        return value

    def validate(self, attrs):
        cost = attrs.get('cost')
        price = attrs.get('price')

        if cost is not None and price is not None and price < cost:
            raise serializers.ValidationError({
                'price': 'El precio no puede ser menor que el costo.'
            })

        return attrs

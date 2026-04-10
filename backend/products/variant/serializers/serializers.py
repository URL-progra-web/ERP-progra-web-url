from rest_framework import serializers
from products.variant.models.models import ProductVariant


class ProductVariantSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    size_name = serializers.CharField(source='size.name', read_only=True)
    color_name = serializers.CharField(source='color.name', read_only=True)
    uom_name = serializers.CharField(source='uom.name', read_only=True)
    image_url = serializers.SerializerMethodField(read_only=True)
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'product',
            'product_name',
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
            'image',
            'image_url',
            'remove_image',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        if not obj.image:
            return None

        request = self.context.get('request')
        if request is None:
            return obj.image.url

        return request.build_absolute_uri(obj.image.url)

    def create(self, validated_data):
        validated_data.pop('remove_image', False)
        return super().create(validated_data)

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
        product = attrs.get('product', getattr(self.instance, 'product', None))
        size = attrs.get('size', getattr(self.instance, 'size', None))
        color = attrs.get('color', getattr(self.instance, 'color', None))

        if cost is not None and price is not None and price < cost:
            raise serializers.ValidationError({
                'price': 'El precio no puede ser menor que el costo.'
            })

        if product is None:
            return attrs

        duplicate = ProductVariant.objects.filter(
            product=product,
            size=size,
            color=color,
        )

        if self.instance:
            duplicate = duplicate.exclude(pk=self.instance.pk)

        if duplicate.exists():
            raise serializers.ValidationError({
                'size': 'Ya existe una variante con esta combinación de producto, talla y color.'
            })

        return attrs

    def update(self, instance, validated_data):
        remove_image = validated_data.pop('remove_image', False)
        new_image = validated_data.get('image')

        if remove_image and instance.image:
            instance.image.delete(save=False)
            validated_data['image'] = None
        elif new_image and instance.image and instance.image.name != new_image.name:
            instance.image.delete(save=False)

        return super().update(instance, validated_data)

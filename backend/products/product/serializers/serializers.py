from rest_framework import serializers
from products.product.models.models import Product


class ProductSerializer(serializers.ModelSerializer):
    entrepreneur_name = serializers.CharField(source='entrepreneur.company_name', read_only=True)
    business_unit_name = serializers.CharField(source='business_unit.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    base_uom_name = serializers.CharField(source='base_uom.name', read_only=True)
    image_url = serializers.SerializerMethodField(read_only=True)
    remove_image = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Product
        fields = [
            'id',
            'entrepreneur',
            'entrepreneur_name',
            'business_unit',
            'business_unit_name',
            'category',
            'category_name',
            'base_uom',
            'base_uom_name',
            'name',
            'description',
            'image',
            'image_url',
            'remove_image',
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

    def update(self, instance, validated_data):
        remove_image = validated_data.pop('remove_image', False)
        new_image = validated_data.get('image')

        if remove_image and instance.image:
            instance.image.delete(save=False)
            validated_data['image'] = None
        elif new_image and instance.image and instance.image.name != new_image.name:
            instance.image.delete(save=False)

        return super().update(instance, validated_data)

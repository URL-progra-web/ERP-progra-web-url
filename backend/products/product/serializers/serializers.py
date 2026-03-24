from rest_framework import serializers
from products.product.models.models import Product


class ProductSerializer(serializers.ModelSerializer):
    entrepreneur_name = serializers.CharField(source='entrepreneur.company_name', read_only=True)
    business_unit_name = serializers.CharField(source='business_unit.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)

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
            'name',
            'description',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
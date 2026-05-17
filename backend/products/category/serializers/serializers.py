from rest_framework import serializers
from products.category.models.models import Category


class CategorySerializer(serializers.ModelSerializer):
    parent_name = serializers.CharField(source='parent.name', read_only=True)

    class Meta:
        model = Category
        fields = [
            'id',
            'parent',
            'parent_name',
            'name',
            'is_leaf',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate(self, attrs):
        parent = attrs.get('parent', getattr(self.instance, 'parent', None))
        is_leaf = attrs.get('is_leaf', getattr(self.instance, 'is_leaf', False))

        if self.instance and parent and self.instance.id == parent.id:
            raise serializers.ValidationError({
                'parent': 'Una categoría no puede ser su propio padre.'
            })

        if parent and parent.is_leaf:
            raise serializers.ValidationError({
                'parent': 'Una categoría final no puede tener subcategorías.'
            })

        if self.instance and is_leaf and self.instance.subcategories.exists():
            raise serializers.ValidationError({
                'is_leaf': 'Una categoría con subcategorías debe ser agrupadora.'
            })

        return attrs

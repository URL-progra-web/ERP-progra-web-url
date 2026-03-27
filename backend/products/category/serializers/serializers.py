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

        if self.instance and parent and self.instance.id == parent.id:
            raise serializers.ValidationError({
                'parent': 'Una categoría no puede ser su propio padre.'
            })

        return attrs
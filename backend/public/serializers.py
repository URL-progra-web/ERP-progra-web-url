from decimal import Decimal
from rest_framework import serializers

from crm.customer.models.models import Customer
from orders.order.models.models import Order
from products.category.models.models import Category
from products.product.models.models import Product
from products.variant.models.models import ProductVariant
from products.size.models.models import Size
from products.color.models.models import Color
from inventory.transaction.services.stock_service import InventoryStockService


class PublicCategorySerializer(serializers.ModelSerializer):
    """Serializer para categorías públicas."""
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'parent']


class PublicCategoryTreeSerializer(serializers.ModelSerializer):
    """Serializer para categorías en estructura de árbol."""
    children = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'children', 'product_count']
    
    def get_children(self, obj):
        children = obj.subcategories.all().order_by('name')
        return PublicCategoryTreeSerializer(children, many=True).data
    
    def get_product_count(self, obj) -> int:
        """Cuenta productos con variantes activas en esta categoría."""
        return Product.objects.filter(
            category=obj,
            productvariant__is_active=True
        ).distinct().count()


class PublicCategoryPathSerializer(serializers.ModelSerializer):
    """Serializer para ruta de categoría (breadcrumb)."""
    
    class Meta:
        model = Category
        fields = ['id', 'name']


class PublicSizeSerializer(serializers.ModelSerializer):
    """Serializer para tallas disponibles."""
    
    class Meta:
        model = Size
        fields = ['id', 'name']


class PublicColorSerializer(serializers.ModelSerializer):
    """Serializer para colores disponibles."""
    
    class Meta:
        model = Color
        fields = ['id', 'name', 'hex_code']


class PublicFiltersSerializer(serializers.Serializer):
    """Serializer para opciones de filtros disponibles."""
    sizes = PublicSizeSerializer(many=True)
    colors = PublicColorSerializer(many=True)
    price_range = serializers.DictField()


class PublicVariantSerializer(serializers.ModelSerializer):
    """Serializer para variantes públicas (sin costo, con disponibilidad)."""
    size_name = serializers.CharField(source='size.name', read_only=True, allow_null=True)
    color_name = serializers.CharField(source='color.name', read_only=True, allow_null=True)
    color_hex = serializers.CharField(source='color.hex_code', read_only=True, allow_null=True)
    is_available = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductVariant
        fields = [
            'id',
            'sku',
            'size',
            'size_name',
            'color',
            'color_name',
            'color_hex',
            'price',
            'is_available',
        ]
    
    def get_is_available(self, obj) -> bool:
        """Indica si hay stock disponible sin mostrar cantidad exacta."""
        stock = InventoryStockService.get_variant_stock(obj.id)
        return stock > 0


class PublicProductSerializer(serializers.ModelSerializer):
    """Serializer para productos públicos con detalle de variantes."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    entrepreneur_name = serializers.CharField(source='entrepreneur.company_name', read_only=True)
    base_uom_name = serializers.CharField(source='base_uom.name', read_only=True)
    variants = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'category',
            'category_name',
            'entrepreneur_name',
            'base_uom_name',
            'variants',
        ]
    
    def get_variants(self, obj):
        """Solo retorna variantes activas."""
        active_variants = obj.productvariant_set.filter(is_active=True).select_related('size', 'color')
        return PublicVariantSerializer(active_variants, many=True).data


class PublicProductListSerializer(serializers.ModelSerializer):
    """Serializer para listado de productos (sin variantes detalladas)."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    entrepreneur_name = serializers.CharField(source='entrepreneur.company_name', read_only=True)
    min_price = serializers.SerializerMethodField()
    has_stock = serializers.SerializerMethodField()
    variant_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'category',
            'category_name',
            'entrepreneur_name',
            'min_price',
            'has_stock',
            'variant_count',
        ]
    
    def get_min_price(self, obj) -> Decimal:
        variants = obj.productvariant_set.filter(is_active=True)
        if variants.exists():
            return min(v.price for v in variants)
        return Decimal('0.00')
    
    def get_has_stock(self, obj) -> bool:
        for variant in obj.productvariant_set.filter(is_active=True):
            if InventoryStockService.get_variant_stock(variant.id) > 0:
                return True
        return False
    
    def get_variant_count(self, obj) -> int:
        return obj.productvariant_set.filter(is_active=True).count()


class PublicOrderItemSerializer(serializers.Serializer):
    """Serializer para items del pedido público."""
    variant_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductVariant.objects.filter(is_active=True)
    )
    quantity = serializers.DecimalField(
        max_digits=14, 
        decimal_places=4, 
        min_value=Decimal('0.0001')
    )
    
    def validate_variant_id(self, value):
        """Valida que la variante tenga stock disponible."""
        stock = InventoryStockService.get_variant_stock(value.id)
        if stock <= 0:
            raise serializers.ValidationError(
                f'El producto {value.sku} no tiene stock disponible.'
            )
        return value


class PublicOrderCreateSerializer(serializers.Serializer):
    """
    Serializer para crear pedidos públicos.
    Requiere datos del cliente y token de Turnstile.
    """
    # Datos del cliente
    customer_name = serializers.CharField(max_length=255, required=True)
    customer_phone = serializers.CharField(max_length=50, required=True)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    
    # Datos del pedido
    shipping_address = serializers.CharField(required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    # Items del carrito
    items = PublicOrderItemSerializer(many=True, required=True)
    
    # Token de seguridad
    turnstile_token = serializers.CharField(required=True)
    
    def validate_customer_phone(self, value):
        """Limpia y valida el teléfono."""
        # Remover espacios y guiones
        cleaned = ''.join(c for c in value if c.isdigit() or c == '+')
        if len(cleaned) < 8:
            raise serializers.ValidationError(
                'El número de teléfono debe tener al menos 8 dígitos.'
            )
        return cleaned
    
    def validate_items(self, value):
        """Valida que haya al menos un item."""
        if not value:
            raise serializers.ValidationError(
                'Debe incluir al menos un producto en el pedido.'
            )
        return value


class PublicOrderResponseSerializer(serializers.ModelSerializer):
    """Serializer para la respuesta después de crear un pedido."""
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    status_name = serializers.CharField(source='status.name', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id',
            'short_id',
            'customer_name',
            'status_name',
            'shipping_address',
            'notes',
            'created_at',
        ]

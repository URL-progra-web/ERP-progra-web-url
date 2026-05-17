from decimal import Decimal

from rest_framework import status
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Min, Max, Q

from crm.customer.models.models import Customer
from inventory.uom.models.models import UoM
from orders.order.services.services import OrderService
from orders.order_item.services.services import OrderItemService
from orders.order_status.models.models import OrderStatus
from products.category.models.models import Category
from products.product.models.models import Product
from products.variant.models.models import ProductVariant
from products.variant.services.services import ProductVariantService
from products.size.models.models import Size
from products.color.models.models import Color

from .serializers import (
    PublicCategorySerializer,
    PublicCategoryTreeSerializer,
    PublicCategoryPathSerializer,
    PublicFiltersSerializer,
    PublicSizeSerializer,
    PublicColorSerializer,
    PublicOrderCreateSerializer,
    PublicOrderResponseSerializer,
    PublicProductListSerializer,
    PublicProductSerializer,
)
from .services.turnstile import TurnstileValidationError, verify_turnstile_token
from .services.notifications import NotificationService
from .throttling import PublicCatalogThrottle, PublicOrderThrottle


class PublicCategoryListView(ListAPIView):
    """Lista todas las categorías disponibles."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PublicCatalogThrottle]
    serializer_class = PublicCategorySerializer
    
    def get_queryset(self):
        return Category.objects.all().order_by('name')


class PublicCategoryTreeView(APIView):
    """Retorna categorías en estructura de árbol jerárquico."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PublicCatalogThrottle]
    
    def get(self, request):
        # Solo categorías raíz (sin padre)
        root_categories = Category.objects.filter(parent__isnull=True).order_by('name')
        serializer = PublicCategoryTreeSerializer(root_categories, many=True)
        return Response(serializer.data)


class PublicCategoryPathView(APIView):
    """Retorna la ruta de ancestros de una categoría (para breadcrumb)."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PublicCatalogThrottle]
    
    def get(self, request, pk):
        try:
            category = Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return Response(
                {'error': 'Categoría no encontrada'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Construir ruta desde la raíz hasta esta categoría
        path = []
        current = category
        while current is not None:
            path.append(current)
            current = current.parent
        
        # Invertir para que vaya de raíz a hoja
        path.reverse()
        
        serializer = PublicCategoryPathSerializer(path, many=True)
        return Response(serializer.data)


class PublicFiltersView(APIView):
    """Retorna opciones de filtros disponibles basadas en variantes con stock."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PublicCatalogThrottle]
    
    def get(self, request):
        # Base queryset de variantes activas
        variants_qs = ProductVariant.objects.filter(is_active=True)
        
        # Filtrar por categoría si se especifica
        category_id = request.query_params.get('category')
        if category_id:
            # Incluir subcategorías
            category_ids = self._get_category_with_descendants(category_id)
            variants_qs = variants_qs.filter(product__category_id__in=category_ids)
        
        # Obtener tallas únicas
        size_ids = variants_qs.exclude(size__isnull=True).values_list('size_id', flat=True).distinct()
        sizes = Size.objects.filter(id__in=size_ids).order_by('name')
        
        # Obtener colores únicos
        color_ids = variants_qs.exclude(color__isnull=True).values_list('color_id', flat=True).distinct()
        colors = Color.objects.filter(id__in=color_ids).order_by('name')
        
        # Obtener rango de precios
        price_stats = variants_qs.aggregate(
            min_price=Min('price'),
            max_price=Max('price')
        )
        
        return Response({
            'sizes': PublicSizeSerializer(sizes, many=True).data,
            'colors': PublicColorSerializer(colors, many=True).data,
            'price_range': {
                'min': float(price_stats['min_price'] or 0),
                'max': float(price_stats['max_price'] or 0),
            }
        })
    
    def _get_category_with_descendants(self, category_id):
        """Obtiene IDs de una categoría y todos sus descendientes."""
        try:
            category_id = int(category_id)
        except (ValueError, TypeError):
            return []
        
        result = [category_id]
        children = Category.objects.filter(parent_id=category_id).values_list('id', flat=True)
        
        for child_id in children:
            result.extend(self._get_category_with_descendants(child_id))
        
        return result


class PublicProductListView(ListAPIView):
    """
    Lista productos disponibles públicamente.
    Soporta filtros por categoría, búsqueda, talla, color y precio.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PublicCatalogThrottle]
    serializer_class = PublicProductListSerializer
    
    def get_queryset(self):
        queryset = Product.objects.select_related(
            'category', 'base_uom', 'entrepreneur'
        ).prefetch_related(
            'productvariant_set'
        ).filter(
            productvariant__is_active=True
        ).distinct()
        
        # Filtro por categoría (incluye subcategorías)
        category_id = self.request.query_params.get('category')
        if category_id:
            category_ids = self._get_category_with_descendants(category_id)
            queryset = queryset.filter(category_id__in=category_ids)
        
        # Búsqueda por nombre
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Filtro por tallas (comma-separated IDs)
        sizes = self.request.query_params.get('sizes')
        if sizes:
            size_ids = [int(s) for s in sizes.split(',') if s.isdigit()]
            if size_ids:
                queryset = queryset.filter(
                    productvariant__size_id__in=size_ids,
                    productvariant__is_active=True
                ).distinct()
        
        # Filtro por colores (comma-separated IDs)
        colors = self.request.query_params.get('colors')
        if colors:
            color_ids = [int(c) for c in colors.split(',') if c.isdigit()]
            if color_ids:
                queryset = queryset.filter(
                    productvariant__color_id__in=color_ids,
                    productvariant__is_active=True
                ).distinct()
        
        # Filtro por rango de precio
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            try:
                queryset = queryset.filter(
                    productvariant__price__gte=Decimal(min_price),
                    productvariant__is_active=True
                ).distinct()
            except:
                pass
        if max_price:
            try:
                queryset = queryset.filter(
                    productvariant__price__lte=Decimal(max_price),
                    productvariant__is_active=True
                ).distinct()
            except:
                pass
        
        # Filtro por emprendedor
        entrepreneur_id = self.request.query_params.get('entrepreneur')
        if entrepreneur_id:
            queryset = queryset.filter(entrepreneur_id=entrepreneur_id)
        
        return queryset.order_by('name')
    
    def _get_category_with_descendants(self, category_id):
        """Obtiene IDs de una categoría y todos sus descendientes."""
        try:
            category_id = int(category_id)
        except (ValueError, TypeError):
            return []
        
        result = [category_id]
        children = Category.objects.filter(parent_id=category_id).values_list('id', flat=True)
        
        for child_id in children:
            result.extend(self._get_category_with_descendants(child_id))
        
        return result


class PublicProductDetailView(RetrieveAPIView):
    """Detalle de un producto con todas sus variantes."""
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PublicCatalogThrottle]
    serializer_class = PublicProductSerializer
    
    def get_queryset(self):
        return Product.objects.select_related(
            'category', 'base_uom', 'entrepreneur'
        ).prefetch_related(
            'productvariant_set__size', 'productvariant_set__color'
        )


class PublicOrderCreateView(APIView):
    """
    Crea un nuevo pedido público.
    Requiere validación de Turnstile y datos del cliente.
    """
    permission_classes = [AllowAny]
    authentication_classes = []
    throttle_classes = [PublicOrderThrottle]
    
    def get_client_ip(self, request):
        """Obtiene la IP del cliente."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
    
    @transaction.atomic
    def post(self, request):
        serializer = PublicOrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        
        # Validar Turnstile
        try:
            verify_turnstile_token(
                token=data['turnstile_token'],
                remote_ip=self.get_client_ip(request)
            )
        except TurnstileValidationError as e:
            return Response(
                {'error': 'Verificación de seguridad fallida', 'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        customer_email = (data.get('customer_email') or '').strip().lower()
        customer = None
        created = False

        # Buscar primero por email para no duplicar clientes con teléfono nuevo.
        if customer_email:
            customer = Customer.objects.filter(email__iexact=customer_email).first()

        if customer is None:
            customer = Customer.objects.filter(phone=data['customer_phone']).first()

        if customer is None:
            customer = Customer.objects.create(
                name=data['customer_name'],
                phone=data['customer_phone'],
                email=customer_email or None,
                customer_type='RETAIL',
            )
            created = True
        
        # Si el cliente existe, actualizar nombre y email si corresponde
        if not created:
            updated = False
            if data['customer_name'] and customer.name != data['customer_name']:
                customer.name = data['customer_name']
                updated = True
            if data.get('customer_email') and not customer.email:
                customer.email = data['customer_email']
                updated = True
            if updated:
                customer.save()
        
        # Obtener o crear estado BORRADOR
        draft_status, _ = OrderStatus.objects.get_or_create(
            name='BORRADOR',
            defaults={'description': 'Pedido creado por cliente, pendiente de revisión'}
        )
        
        # Preparar items para el servicio
        items_payload = []
        for item in data['items']:
            variant = item['variant_id']
            base_uom = variant.product.base_uom
            
            items_payload.append({
                'variant_id': variant.id,
                'selected_uom': base_uom,
                'quantity': item['quantity'],
            })
        
        # Crear orden con items
        product_variant_service = ProductVariantService()
        order_item_service = OrderItemService(product_service=product_variant_service)
        order_service = OrderService(order_item_service=order_item_service)
        
        order = order_service.create_order_with_items(
            customer=customer,
            items_payload=items_payload,
            status=draft_status,
            shipping_address=data.get('shipping_address', '') or '',
            notes=data.get('notes', '') or '',
        )
        
        # Enviar notificación a admins
        NotificationService.send_new_order_notification(order)
        
        # Respuesta
        response_serializer = PublicOrderResponseSerializer(order)
        return Response(
            {
                'message': 'Pedido creado exitosamente',
                'order': response_serializer.data
            },
            status=status.HTTP_201_CREATED
        )

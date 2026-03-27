from decimal import Decimal
from typing import Any, Dict, Optional

from inventory.transaction.services.stock_service import InventoryStockService
from orders.products.interfaces import IProductService
from products.variant.models.models import ProductVariant


class ProductVariantService(IProductService):
    """
    Service to handle product variant operations.
    Implements IProductService interface for use in orders module.
    """

    def __init__(self):
        self.stock_service = InventoryStockService()

    def get_variant_by_id(self, variant_id: int) -> Optional[Dict[str, Any]]:
        """Get a product variant by its ID with all related data."""
        try:
            variant = ProductVariant.objects.select_related(
                'product', 'product__base_uom', 'product__business_unit', 'size', 'color'
            ).get(id=variant_id)
            
            return self._serialize_variant(variant)
        except ProductVariant.DoesNotExist:
            return None

    def get_variant_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
        """Get a product variant by its SKU."""
        try:
            variant = ProductVariant.objects.select_related(
                'product', 'product__base_uom', 'product__business_unit', 'size', 'color'
            ).get(sku=sku)
            
            return self._serialize_variant(variant)
        except ProductVariant.DoesNotExist:
            return None

    def validate_variant_availability(
        self,
        variant_id: int,
        quantity: int,
        business_unit_id: int
    ) -> tuple[bool, Optional[str]]:
        """Validate if a variant is available for ordering."""
        variant_data = self.get_variant_by_id(variant_id)
        
        if not variant_data:
            return False, f"Variante con ID {variant_id} no encontrada"
        
        if not variant_data.get('is_active', False):
            return False, f"La variante {variant_data.get('sku')} no está activa"
        
        if variant_data.get('business_unit_id') != business_unit_id:
            return False, f"La variante {variant_data.get('sku')} no pertenece a la unidad de negocio especificada"
        
        available = variant_data.get('quantity_available', 0)
        if available < quantity:
            return False, f"Stock insuficiente para {variant_data.get('sku')}. Disponible: {available}, solicitado: {quantity}"
        
        return True, None

    def get_variants_by_business_unit(self, business_unit_id: int) -> list[Dict[str, Any]]:
        """Get all active variants for a specific business unit."""
        variants = ProductVariant.objects.select_related(
            'product', 'product__base_uom', 'product__business_unit', 'size', 'color'
        ).filter(
            product__business_unit_id=business_unit_id,
            is_active=True
        )
        
        return [self._serialize_variant(v) for v in variants]

    def calculate_line_total(
        self,
        variant_id: int,
        quantity: int,
        use_cost: bool = False
    ) -> Optional[float]:
        """Calculate total for a line item (price or cost * quantity)."""
        variant_data = self.get_variant_by_id(variant_id)
        
        if not variant_data:
            return None
        
        unit_value = variant_data.get('cost') if use_cost else variant_data.get('price')
        return float(Decimal(str(unit_value)) * Decimal(str(quantity)))

    def _serialize_variant(self, variant: ProductVariant) -> Dict[str, Any]:
        """Serialize a variant to dictionary format."""
        stock = self.stock_service.get_variant_stock(variant.id)
        
        return {
            'id': variant.id,
            'sku': variant.sku,
            'price': float(variant.price),
            'cost': float(variant.cost),
            'quantity_available': float(stock),
            'is_active': variant.is_active,
            'product_id': variant.product_id,
            'product_name': variant.product.name,
            'business_unit_id': variant.product.business_unit_id,
            'business_unit': variant.product.business_unit.name if variant.product.business_unit else None,
            'base_uom_id': variant.product.base_uom_id,
            'base_uom': variant.product.base_uom.name if variant.product.base_uom else None,
            'size_id': variant.size_id,
            'size': variant.size.name if variant.size else None,
            'color_id': variant.color_id,
            'color': variant.color.name if variant.color else None,
        }

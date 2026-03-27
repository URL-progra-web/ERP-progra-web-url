"""Product service implementation for the orders module."""

from decimal import Decimal
from typing import Optional, Dict, Any

from inventory.transaction.services.stock_service import InventoryStockService
from orders.products.interfaces import IProductService
from products.variant.models.models import ProductVariant


class ProductService(IProductService):
    """
    Product service used by orders.

    It reads ProductVariant data from the products module and adapts it to the
    dictionary contract expected by OrderItemService.
    """

    def __init__(self):
        self.stock_service = InventoryStockService()

    def get_variant_by_id(self, variant_id: int) -> Optional[Dict[str, Any]]:
        """Get variant by ID with full details."""
        try:
            variant = ProductVariant.objects.select_related(
                'product',
                'product__business_unit',
                'product__base_uom',
            ).get(id=variant_id)
            
            return self._variant_to_dict(variant)
        except ProductVariant.DoesNotExist:
            return None

    def get_variant_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
        """Get variant by SKU."""
        try:
            variant = ProductVariant.objects.select_related(
                'product',
                'product__business_unit',
                'product__base_uom',
            ).get(sku=sku)
            
            return self._variant_to_dict(variant)
        except ProductVariant.DoesNotExist:
            return None

    def validate_variant_availability(
        self,
        variant_id: int,
        quantity: Decimal,
        business_unit_id: int
    ) -> tuple[bool, Optional[str]]:
        try:
            variant = ProductVariant.objects.select_related(
                'product',
                'product__business_unit',
                'product__base_uom',
            ).get(id=variant_id)
            
            # Check if active
            if not variant.is_active:
                return False, f"Product variant {variant.sku} is not active"
            
            # Check if belongs to business unit
            if variant.product.business_unit_id != business_unit_id:
                return False, f"Variant {variant.sku} does not belong to business unit {business_unit_id}"
            
            # Check quantity
            stock = self.stock_service.get_variant_stock(variant.id)
            if stock < quantity:
                return False, f"Insufficient stock. Available: {stock}, Requested: {quantity}"
            
            return True, None
            
        except ProductVariant.DoesNotExist:
            return False, f"Variant with ID {variant_id} not found"

    def get_variants_by_business_unit(self, business_unit_id: int) -> list[Dict[str, Any]]:
        """
        Get all active variants for a business unit.
        
        Filters by:
        - Product belongs to business_unit
        - Variant is_active = True
        - quantity_available > 0
        """
        variants = ProductVariant.objects.filter(
            product__business_unit_id=business_unit_id,
            is_active=True,
        ).select_related(
            'product',
            'product__business_unit',
            'product__base_uom',
            'size',
            'color',
        )

        return [self._variant_to_dict(v) for v in variants if self.stock_service.get_variant_stock(v.id) > 0]

    def calculate_line_total(
        self,
        variant_id: int,
        quantity: int,
        use_cost: bool = False
    ) -> Optional[float]:
        """Calculate total for line item."""
        try:
            variant = ProductVariant.objects.get(id=variant_id)
            unit_amount = variant.cost if use_cost else variant.price
            return float(unit_amount) * quantity
        except ProductVariant.DoesNotExist:
            return None

    @staticmethod
    def _variant_to_dict(variant: ProductVariant) -> Dict[str, Any]:
        return {
            'id': variant.id,
            'sku'               : variant.sku,
            'product_id'        : variant.product_id,
            'product_name'      : variant.product.name,
            'business_unit_id'  : variant.product.business_unit_id,
            'size'              : variant.size.name if variant.size else None,
            'color'             : variant.color.name if variant.color else None,
            'base_uom_id'       : variant.product.base_uom_id,
            'base_uom'          : variant.product.base_uom.name if variant.product.base_uom else None,
            'cost'              : float(variant.cost),
            'price'             : float(variant.price),
            'quantity_available': float(InventoryStockService.get_variant_stock(variant.id)),
            'is_active'         : variant.is_active,
            'created_at'        : variant.created_at.isoformat() if variant.created_at else None,
            'updated_at'        : variant.updated_at.isoformat() if variant.updated_at else None,
        }


# Backward-compatibility alias while imports are migrated.
ProductServiceMock = ProductService

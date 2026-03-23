from abc import ABC, abstractmethod
from typing import Optional, Dict, Any


class IProductService(ABC):

    @abstractmethod
    def get_variant_by_id(self, variant_id: int) -> Optional[Dict[str, Any]]:
        """
        Get a product variant by its ID.
        
        Args:
            variant_id: The ProductVariant ID
            
        Returns:
            Dictionary with variant data or None if not found
            Expected keys: id, sku, price, cost, quantity_available, is_active, product_id
        """
        pass

    @abstractmethod
    def get_variant_by_sku(self, sku: str) -> Optional[Dict[str, Any]]:
        pass

    @abstractmethod
    def validate_variant_availability(
        self,
        variant_id: int,
        quantity: int,
        business_unit_id: int
    ) -> tuple[bool, Optional[str]]:
        """
        Validate if a variant is available for ordering.
        
        Args:
            variant_id: The ProductVariant ID
            quantity: Quantity requested
            business_unit_id: Business unit context
            
        Returns:
            Tuple[is_valid, error_message]
            - is_valid: True if variant can be ordered
            - error_message: None if valid, error description if invalid
        """
        pass

    @abstractmethod
    def get_variants_by_business_unit(self, business_unit_id: int) -> list[Dict[str, Any]]:
        """
        Get all active variants for a specific business unit.
        
        Args:
            business_unit_id: The business unit ID
            
        Returns:
            List of variant dictionaries
        """
        pass

    @abstractmethod
    def calculate_line_total(
        self,
        variant_id: int,
        quantity: int,
        use_cost: bool = False
    ) -> Optional[float]:
        """
        Calculate total for a line item (price or cost * quantity).
        
        Args:
            variant_id: The ProductVariant ID
            quantity: Quantity
            use_cost: If True, use cost; if False, use price
            
        Returns:
            Calculated total or None if variant not found
        """
        pass

from inventory.uom.repositories.repositories import UomRepository
from inventory.uom.services.services import UomService
from inventory.uom_conversion.repositories.repositories import UomConversionRepository
from inventory.uom_conversion.services.services import UomConversionService

class InventoryContainer:
    def __init__(self):
        self.uom_repository = UomRepository()
        self.uom_service = UomService(repository=self.uom_repository)
        
        self.uom_conversion_repository = UomConversionRepository()
        self.uom_conversion_service = UomConversionService(
            repository=self.uom_conversion_repository
        )

# Global container instance
inventory_container = InventoryContainer()

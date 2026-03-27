from decimal import Decimal

from django.db.models import DecimalField, ExpressionWrapper, F, Sum

from inventory.transaction.models.models import InventoryTransaction


class InventoryStockService:
    @staticmethod
    def get_variant_stock(variant_id: int) -> Decimal:
        movement = ExpressionWrapper(
            F('base_quantity') * F('transaction_type__factor'),
            output_field=DecimalField(max_digits=18, decimal_places=4),
        )
        total = InventoryTransaction.objects.filter(variant_id=variant_id).aggregate(total=Sum(movement)).get('total')
        return total if total is not None else Decimal('0')

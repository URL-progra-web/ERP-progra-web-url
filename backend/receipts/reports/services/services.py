from django.db.models import Sum, Count, F, ExpressionWrapper, DecimalField
from django.db.models.functions import TruncDay, TruncMonth
from receipts.receipt.models.models import Receipt
from orders.order_item.models.models import OrderItem

_DECIMAL = DecimalField(max_digits=20, decimal_places=4)


class BillingReportService:

    def _base_qs(self, date_after=None, date_before=None, user_id=None, entrepreneur_id=None):
        qs = Receipt.objects.select_related('order__customer', 'issued_by')
        if date_after:
            qs = qs.filter(issued_at__date__gte=date_after)
        if date_before:
            qs = qs.filter(issued_at__date__lte=date_before)
        if user_id:
            qs = qs.filter(issued_by__id=user_id)
        if entrepreneur_id:
            # Use subquery to avoid duplicate rows from JOIN through order items
            order_ids = (
                OrderItem.objects
                .filter(variant__product__entrepreneur__id=entrepreneur_id)
                .values_list('order_id', flat=True)
                .distinct()
            )
            qs = qs.filter(order_id__in=order_ids)
        return qs

    def summary(self, date_after=None, date_before=None, user_id=None, entrepreneur_id=None):
        qs = self._base_qs(date_after, date_before, user_id, entrepreneur_id)
        result = qs.aggregate(
            total_receipts=Count('id'),
            total_billed=Sum('grand_total'),
            total_subtotal=Sum('subtotal'),
            total_shipping=Sum('shipping_total'),
            total_discounts=Sum('discount_total'),
        )
        return {
            'total_receipts': result['total_receipts'] or 0,
            'total_billed': float(result['total_billed'] or 0),
            'total_subtotal': float(result['total_subtotal'] or 0),
            'total_shipping': float(result['total_shipping'] or 0),
            'total_discounts': float(result['total_discounts'] or 0),
        }

    def by_day(self, date_after=None, date_before=None, user_id=None, entrepreneur_id=None):
        qs = self._base_qs(date_after, date_before, user_id, entrepreneur_id)
        rows = (
            qs
            .annotate(day=TruncDay('issued_at'))
            .values('day')
            .annotate(total=Sum('grand_total'), count=Count('id'))
            .order_by('day')
        )
        return [
            {
                'day': row['day'].date().isoformat(),
                'total': float(row['total'] or 0),
                'count': row['count'],
            }
            for row in rows
        ]

    def by_month(self, date_after=None, date_before=None, user_id=None, entrepreneur_id=None):
        qs = self._base_qs(date_after, date_before, user_id, entrepreneur_id)
        rows = (
            qs
            .annotate(month=TruncMonth('issued_at'))
            .values('month')
            .annotate(total=Sum('grand_total'), count=Count('id'))
            .order_by('month')
        )
        return [
            {
                'month': row['month'].date().isoformat(),
                'total': float(row['total'] or 0),
                'count': row['count'],
            }
            for row in rows
        ]

    def by_customer(self, date_after=None, date_before=None, user_id=None, entrepreneur_id=None):
        qs = self._base_qs(date_after, date_before, user_id, entrepreneur_id)
        rows = (
            qs
            .values('order__customer__id', 'order__customer__name')
            .annotate(total=Sum('grand_total'), count=Count('id'))
            .order_by('-total')
        )
        return [
            {
                'customer_id': row['order__customer__id'],
                'customer_name': row['order__customer__name'] or '—',
                'total': float(row['total'] or 0),
                'count': row['count'],
            }
            for row in rows
        ]

    def by_user(self, date_after=None, date_before=None, user_id=None, entrepreneur_id=None):
        qs = self._base_qs(date_after, date_before, user_id, entrepreneur_id)
        rows = (
            qs
            .values('issued_by__id', 'issued_by__name')
            .annotate(total=Sum('grand_total'), count=Count('id'))
            .order_by('-total')
        )
        return [
            {
                'user_id': row['issued_by__id'],
                'user_name': row['issued_by__name'] or '—',
                'total': float(row['total'] or 0),
                'count': row['count'],
            }
            for row in rows
        ]

    def by_entrepreneur(self, date_after=None, date_before=None, user_id=None, entrepreneur_id=None):
        # Get order IDs from receipts in scope (date/user filters apply at receipt level)
        receipt_qs = Receipt.objects.all()
        if date_after:
            receipt_qs = receipt_qs.filter(issued_at__date__gte=date_after)
        if date_before:
            receipt_qs = receipt_qs.filter(issued_at__date__lte=date_before)
        if user_id:
            receipt_qs = receipt_qs.filter(issued_by__id=user_id)
        order_ids = receipt_qs.values_list('order_id', flat=True)

        qs = OrderItem.objects.filter(order_id__in=order_ids)
        if entrepreneur_id:
            qs = qs.filter(variant__product__entrepreneur__id=entrepreneur_id)

        rows = (
            qs
            .values('variant__product__entrepreneur__id', 'variant__product__entrepreneur__company_name')
            .annotate(
                total=Sum(ExpressionWrapper(F('quantity') * F('unit_price'), output_field=_DECIMAL)),
                count=Count('order_id', distinct=True),
            )
            .order_by('-total')
        )
        return [
            {
                'entrepreneur_id': row['variant__product__entrepreneur__id'],
                'entrepreneur_name': row['variant__product__entrepreneur__company_name'] or '—',
                'total': float(row['total'] or 0),
                'count': row['count'],
            }
            for row in rows
        ]

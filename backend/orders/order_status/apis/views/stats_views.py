from django.db.models import Count
from django.db.models.functions import TruncDate
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.order.models.models import Order
from users.permissions import HasRole


class OrderStatsDailyAPIView(APIView):
    """
    GET /orders/statuses/stats/daily/

    Returns the count of orders created per day, grouped by status.

    Query params:
      - date_from  YYYY-MM-DD  (optional)
      - date_to    YYYY-MM-DD  (optional)
      - statuses   comma-separated status names (optional)

    Response:
      { "statuses": [...], "series": [{"date": "YYYY-MM-DD", STATUS: count, ...}] }
    """
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def get(self, request):
        date_from      = request.query_params.get('date_from')
        date_to        = request.query_params.get('date_to')
        statuses_param = request.query_params.get('statuses')

        qs = Order.objects.select_related('status')
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)
        if statuses_param:
            names = [s.strip().upper() for s in statuses_param.split(',') if s.strip()]
            qs = qs.filter(status__name__in=names)

        rows = (
            qs
            .annotate(day=TruncDate('created_at'))
            .values('day', 'status__name')
            .annotate(count=Count('id'))
            .order_by('day', 'status__name')
        )

        status_names = sorted({r['status__name'] for r in rows})

        by_date: dict = {}
        for row in rows:
            day_str = row['day'].strftime('%Y-%m-%d')
            by_date.setdefault(day_str, {})['date'] = day_str
            by_date[day_str][row['status__name']] = row['count']

        series = []
        for day_str in sorted(by_date):
            entry = {'date': day_str}
            for s in status_names:
                entry[s] = by_date[day_str].get(s, 0)
            series.append(entry)

        return Response({'statuses': status_names, 'series': series})


class OrderStatsCumulativeAPIView(APIView):
    """
    GET /orders/statuses/stats/cumulative/

    Returns the running total of orders per status up to each day.

    Query params:
      - date_from  YYYY-MM-DD  (optional) — limits the X-axis window
      - date_to    YYYY-MM-DD  (optional)
      - statuses   comma-separated status names (optional)

    Response:
      { "statuses": [...], "series": [{"date": "YYYY-MM-DD", STATUS: running_total, ...}] }
    """
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def get(self, request):
        date_from      = request.query_params.get('date_from')
        date_to        = request.query_params.get('date_to')
        statuses_param = request.query_params.get('statuses')

        qs = Order.objects.select_related('status')
        if statuses_param:
            names = [s.strip().upper() for s in statuses_param.split(',') if s.strip()]
            qs = qs.filter(status__name__in=names)

        qs_window = qs
        if date_from:
            qs_window = qs_window.filter(created_at__date__gte=date_from)
        if date_to:
            qs_window = qs_window.filter(created_at__date__lte=date_to)

        rows = (
            qs_window
            .annotate(day=TruncDate('created_at'))
            .values('day', 'status__name')
            .annotate(count=Count('id'))
            .order_by('day', 'status__name')
        )

        status_names = sorted({r['status__name'] for r in rows})

        daily: dict = {}
        for row in rows:
            day_str = row['day'].strftime('%Y-%m-%d')
            daily.setdefault(day_str, {})[row['status__name']] = row['count']

        running = {s: 0 for s in status_names}
        series = []
        for day_str in sorted(daily):
            for s in status_names:
                running[s] += daily[day_str].get(s, 0)
            series.append({'date': day_str, **{s: running[s] for s in status_names}})

        return Response({'statuses': status_names, 'series': series})

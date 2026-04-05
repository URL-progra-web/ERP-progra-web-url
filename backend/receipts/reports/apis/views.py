from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from receipts.reports.services.services import BillingReportService


class BillingReportViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.service = BillingReportService()

    def _get_filters(self, request):
        return {
            'date_after': request.query_params.get('date_after'),
            'date_before': request.query_params.get('date_before'),
            'user_id': request.query_params.get('user_id'),
        }

    @action(detail=False, methods=['get'], url_path='summary')
    def summary(self, request):
        filters = self._get_filters(request)
        data = self.service.summary(**filters)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-day')
    def by_day(self, request):
        filters = self._get_filters(request)
        data = self.service.by_day(**filters)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-month')
    def by_month(self, request):
        filters = self._get_filters(request)
        data = self.service.by_month(**filters)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-customer')
    def by_customer(self, request):
        filters = self._get_filters(request)
        data = self.service.by_customer(**filters)
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='by-user')
    def by_user(self, request):
        filters = self._get_filters(request)
        data = self.service.by_user(**filters)
        return Response(data, status=status.HTTP_200_OK)
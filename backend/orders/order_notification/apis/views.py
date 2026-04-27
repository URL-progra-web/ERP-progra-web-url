from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ReadOnlyModelViewSet

from core.mixins import PaginationMixin
from orders.order_notification.serializers.serializers import OrderNotificationSerializer
from orders.order_notification.services.services import OrderNotificationService
from users.permissions import HasRole


class OrderNotificationViewSet(ReadOnlyModelViewSet, PaginationMixin):
    serializer_class = OrderNotificationSerializer
    permission_classes = [IsAuthenticated, HasRole]
    allowed_roles = ['ADMIN', 'MANAGER']

    def list(self, request, *args, **kwargs):
        queryset = OrderNotificationService.list_notifications()
        return PaginationMixin.paginate_queryset(self, queryset, OrderNotificationSerializer, request)

    def get_queryset(self):
        return OrderNotificationService.list_notifications()

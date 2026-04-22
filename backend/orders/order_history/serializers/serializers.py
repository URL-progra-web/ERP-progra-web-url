from rest_framework import serializers
from orders.order_history.models.models import OrderStatusHistory


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    status_name = serializers.CharField(source='status.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    previous_status_name = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = (
            'id',
            'order',
            'user',
            'user_name',
            'status',
            'status_name',
            'previous_status_name',
            'notes',
            'created_at',
        )

    def get_previous_status_name(self, obj):
        prev = OrderStatusHistory.objects.filter(
            order=obj.order,
            created_at__lt=obj.created_at,
        ).order_by('-created_at').values('status__name').first()
        return prev['status__name'] if prev else None
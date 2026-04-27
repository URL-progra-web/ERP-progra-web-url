from rest_framework import serializers

from orders.order_notification.models.models import OrderNotification


class OrderNotificationSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    order_short_id = serializers.CharField(source='order.short_id', read_only=True)
    customer_name = serializers.CharField(source='order.customer.name', read_only=True)

    class Meta:
        model = OrderNotification
        fields = (
            'id',
            'order_id',
            'order_short_id',
            'customer_name',
            'title',
            'message',
            'created_at',
        )

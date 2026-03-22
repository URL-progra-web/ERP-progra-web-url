from django.db import DatabaseError
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from orders.order.serializers.serializers import (
    CustomerLookupSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    PaymentMethodLookupSerializer,
)
from orders.order.services.catalogs import get_order_catalogs
from orders.order.services.services import create_order, get_orders

class OrderAPIView(APIView):
    def get(self, request):
        try:
            orders = get_orders()
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Invalid data", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            validated_data = serializer.validated_data
            order = create_order(
                customer_id=validated_data['customer_id'],
                status_id=validated_data.get('status_id'),
                payment_method_id=validated_data.get('payment_method_id'),
                short_id=validated_data.get('short_id'),
                shipping_address=validated_data.get('shipping_address'),
                shipping_cost=validated_data.get('shipping_cost', 0.00),
                notes=validated_data.get('notes')
            )
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except DatabaseError as e:
            return Response(
                {"message": f"Database error: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderCatalogAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        customers, payment_methods = get_order_catalogs()
        return Response({
            'customers': CustomerLookupSerializer(customers, many=True).data,
            'payment_methods': PaymentMethodLookupSerializer(payment_methods, many=True).data,
        }, status=status.HTTP_200_OK)

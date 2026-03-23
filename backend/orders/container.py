from orders.products.services import ProductServiceMock
from orders.products.interfaces import IProductService
from orders.order.repositories.repositories import OrderRepository
from orders.order.services.services import OrderService


class OrdersContainer:
    """
    Container for orders module dependencies.
    
    Instantiates all services and repositories needed by the orders module.
    Using a container pattern allows us to:
    - Avoid creating multiple instances of the same service
    - Centralize dependency configuration
    - Easily swap implementations (e.g., replace ProductServiceMock with real ProductService)
    - Mock dependencies during testing
    
    Example usage in APIs:
        from orders.container import orders_container
        
        class OrderCreateAPI(APIView):
            def post(self, request):
                variant = orders_container.product_service.get_variant_by_id(123)
    """

    def __init__(self):
        # Reemplazar service con:
        # from products.services import ProductService
        # self.product_service: IProductService = ProductService(...)
        self.product_service: IProductService = ProductServiceMock()

        # Order domain dependencies
        self.order_repository = OrderRepository()
        self.order_service = OrderService(repository=self.order_repository)


orders_container = OrdersContainer()

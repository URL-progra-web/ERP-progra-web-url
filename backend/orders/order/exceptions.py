class OrderError(Exception):
    """Base exception for order domain."""


class OrderNotFound(OrderError):
    """Raised when an order cannot be found."""


class InvalidOrderData(OrderError):
    """Raised when order payload is invalid from a business perspective."""


class DuplicateOrderShortId(OrderError):
    """Raised when an order short_id is already in use."""


class OrderStatusDefaultNotConfigured(OrderError):
    """Raised when no default status exists for order creation."""


__all__ = [
    'OrderError',
    'OrderNotFound',
    'InvalidOrderData',
    'DuplicateOrderShortId',
    'OrderStatusDefaultNotConfigured',
]

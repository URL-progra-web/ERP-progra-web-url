class OrderError(Exception):
    """Base exception for order domain."""


class OrderNotFound(OrderError):
    """Raised when an order cannot be found."""


__all__ = ['OrderError', 'OrderNotFound']

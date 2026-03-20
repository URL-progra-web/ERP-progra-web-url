class OrderStatusError(Exception):
    """Base exception for order status domain."""


class OrderStatusNotFound(OrderStatusError):
    """Raised when an order status record cannot be found."""


class OrderStatusInUse(OrderStatusError):
    """Raised when attempting to delete an order status that is referenced elsewhere."""


class InvalidOrderStatusTransition(OrderStatusError):
    """Raised when a requested status transition is not allowed."""


class OrderAlreadyTerminal(OrderStatusError):
    """Raised when trying to modify a delivered/cancelled order."""


__all__ = [
    'OrderStatusError',
    'OrderStatusNotFound',
    'OrderStatusInUse',
    'InvalidOrderStatusTransition',
    'OrderAlreadyTerminal',
]

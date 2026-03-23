class OrderItemError(Exception):
	"""Base exception for order item domain errors."""


class OrderItemNotFound(OrderItemError):
	"""Raised when an order item cannot be found."""


class InvalidOrderItemData(OrderItemError):
	"""Raised when provided data is invalid for order item operations."""


class OrderItemStockUnavailable(OrderItemError):
	"""Raised when requested quantity exceeds available stock."""


class OrderItemBusinessUnitMismatch(OrderItemError):
	"""Raised when order items mix variants from different business units."""


class OrderItemStatusDefaultNotConfigured(OrderItemError):
	"""Raised when no default status exists for order item creation."""


class DuplicateOrderItemVariant(OrderItemError):
	"""Raised when attempting to add duplicated variant for the same order."""


__all__ = [
	'OrderItemError',
	'OrderItemNotFound',
	'InvalidOrderItemData',
	'OrderItemStockUnavailable',
	'OrderItemBusinessUnitMismatch',
	'OrderItemStatusDefaultNotConfigured',
	'DuplicateOrderItemVariant',
]

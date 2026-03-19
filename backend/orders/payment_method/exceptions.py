class PaymentMethodError(Exception):
    """Base class for payment method related errors."""


class PaymentMethodNotFound(PaymentMethodError):
    """Raised when a payment method cannot be located."""


class PaymentMethodAlreadyExists(PaymentMethodError):
    """Raised when attempting to create or rename a payment method with a duplicate name."""


class PaymentMethodInUse(PaymentMethodError):
    """Raised when trying to delete a payment method that is referenced by existing orders."""


__all__ = [
    'PaymentMethodError',
    'PaymentMethodNotFound',
    'PaymentMethodAlreadyExists',
    'PaymentMethodInUse',
]

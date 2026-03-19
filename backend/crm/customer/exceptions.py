class CustomerError(Exception):
    """Base exception for customer operations."""


class CustomerNotFound(CustomerError):
    """Raised when a customer cannot be located."""


class CustomerAlreadyExists(CustomerError):
    """Raised when attempting to create a duplicated customer (email/phone)."""


__all__ = ['CustomerError', 'CustomerNotFound', 'CustomerAlreadyExists']

class EntrepreneurError(Exception):
    """Base exception for entrepreneur operations."""


class EntrepreneurNotFound(EntrepreneurError):
    """Raised when an entrepreneur cannot be located."""


class EntrepreneurAlreadyExists(EntrepreneurError):
    """Raised when attempting to create a duplicated entrepreneur (email/phone)."""


__all__ = ['EntrepreneurError', 'EntrepreneurNotFound', 'EntrepreneurAlreadyExists']

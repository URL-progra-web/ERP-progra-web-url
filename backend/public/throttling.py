from rest_framework.throttling import AnonRateThrottle


class PublicOrderThrottle(AnonRateThrottle):
    """
    Rate limiting para creación de pedidos públicos.
    Limita a 5 pedidos por hora por IP.
    """
    rate = '5/hour'
    scope = 'public_order'


class PublicCatalogThrottle(AnonRateThrottle):
    """
    Rate limiting para consultas al catálogo público.
    Más permisivo que para pedidos.
    """
    rate = '100/minute'
    scope = 'public_catalog'

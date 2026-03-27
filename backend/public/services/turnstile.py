import requests
from django.conf import settings


class TurnstileValidationError(Exception):
    """Error cuando falla la validación de Turnstile."""
    pass


def verify_turnstile_token(token: str, remote_ip: str = None) -> bool:
    """
    Verifica el token de Cloudflare Turnstile.
    
    Args:
        token: El token generado por el widget de Turnstile
        remote_ip: IP del cliente (opcional)
    
    Returns:
        True si la verificación es exitosa
    
    Raises:
        TurnstileValidationError si falla la verificación
    """
    secret_key = getattr(settings, 'TURNSTILE_SECRET_KEY', None)
    
    if not secret_key:
        # En desarrollo, si no hay key configurada, permitir
        if settings.DEBUG:
            return True
        raise TurnstileValidationError('TURNSTILE_SECRET_KEY no está configurado')
    
    data = {
        'secret': secret_key,
        'response': token,
    }
    
    if remote_ip:
        data['remoteip'] = remote_ip
    
    try:
        response = requests.post(
            'https://challenges.cloudflare.com/turnstile/v0/siteverify',
            data=data,
            timeout=10
        )
        result = response.json()
        
        if not result.get('success'):
            error_codes = result.get('error-codes', [])
            raise TurnstileValidationError(
                f'Verificación de Turnstile fallida: {", ".join(error_codes)}'
            )
        
        return True
        
    except requests.RequestException as e:
        raise TurnstileValidationError(f'Error al verificar con Turnstile: {str(e)}')

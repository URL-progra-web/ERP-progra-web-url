import logging

from django.conf import settings
from django.core.mail import send_mail
from django.utils.html import strip_tags

from orders.order_notification.services.services import OrderNotificationService
from users.user.models.models import User


logger = logging.getLogger(__name__)


class NotificationService:
    """Servicio para enviar notificaciones de nuevos pedidos."""
    
    @staticmethod
    def get_admin_emails() -> list[str]:
        """Obtiene los emails de todos los usuarios ADMIN activos."""
        return list(
            User.objects.filter(
                role__name__iexact='ADMIN',
                is_active=True,
                email__isnull=False
            ).exclude(email='').values_list('email', flat=True)
        )
    
    @classmethod
    def send_new_order_notification(cls, order) -> bool:
        """
        Envía una notificación por email cuando se crea un nuevo pedido público.
        
        Args:
            order: Instancia del pedido creado
        
        Returns:
            True si se envió correctamente, False en caso contrario
        """
        OrderNotificationService.create_new_public_order_notification(order)

        admin_emails = cls.get_admin_emails()
        if not admin_emails:
            return True
        
        subject = f'Nuevo pedido: {order.short_id}'
        
        # Calcular totales
        items = order.items.select_related(
            'variant', 'variant__product', 'variant__size', 'variant__color'
        ).all()
        
        total_items = sum(item.quantity for item in items)
        total_amount = sum(item.quantity * item.unit_price for item in items)
        
        context = {
            'order': order,
            'customer': order.customer,
            'items': items,
            'total_items': total_items,
            'total_amount': total_amount,
        }
        
        # Crear mensaje HTML y texto plano
        html_message = cls._build_html_message(context)
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@erp.com'),
                recipient_list=admin_emails,
                html_message=html_message,
                fail_silently=False,
            )
            return True
        except Exception:
            logger.exception('Error enviando email de notificación')
            return False
    
    @staticmethod
    def _build_html_message(context) -> str:
        """Construye el mensaje HTML del email."""
        order = context['order']
        customer = context['customer']
        items = context['items']
        
        items_html = ''
        for item in items:
            items_html += f'''
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">
                    {item.variant.product.name} - {item.variant.sku}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
                    {item.quantity}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
                    ${item.unit_price}
                </td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
                    ${item.quantity * item.unit_price}
                </td>
            </tr>
            '''
        
        return f'''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Nuevo Pedido Recibido</h2>
            
            <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0;">Pedido: {order.short_id}</h3>
                <p style="margin: 5px 0;"><strong>Estado:</strong> {order.status.name}</p>
                <p style="margin: 5px 0;"><strong>Fecha:</strong> {order.created_at.strftime('%d/%m/%Y %H:%M')}</p>
            </div>
            
            <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="margin: 0 0 10px 0;">Datos del Cliente</h3>
                <p style="margin: 5px 0;"><strong>Nombre:</strong> {customer.name}</p>
                <p style="margin: 5px 0;"><strong>Teléfono:</strong> {customer.phone}</p>
                <p style="margin: 5px 0;"><strong>Email:</strong> {customer.email or 'No proporcionado'}</p>
                {f'<p style="margin: 5px 0;"><strong>Dirección:</strong> {order.shipping_address}</p>' if order.shipping_address else ''}
            </div>
            
            <h3>Productos</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #333; color: white;">
                        <th style="padding: 10px; text-align: left;">Producto</th>
                        <th style="padding: 10px; text-align: center;">Cantidad</th>
                        <th style="padding: 10px; text-align: right;">Precio</th>
                        <th style="padding: 10px; text-align: right;">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
                <tfoot>
                    <tr style="font-weight: bold; background: #f5f5f5;">
                        <td colspan="3" style="padding: 10px; text-align: right;">Total:</td>
                        <td style="padding: 10px; text-align: right;">${context['total_amount']}</td>
                    </tr>
                </tfoot>
            </table>
            
            {f'<div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;"><strong>Notas:</strong> {order.notes}</div>' if order.notes else ''}
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
            
            <p style="color: #666; font-size: 12px;">
                Este pedido requiere seguimiento. Contacta al cliente por WhatsApp para confirmar.
            </p>
        </body>
        </html>
        '''

# Payment Methods - Frontend

## Objetivo

Documentar la pantalla de mantenimiento de metodos de pago del backoffice.

## Archivos clave

- `frontend/src/modules/orders/paymentMethods/PaymentMethodsPage.jsx`
- `frontend/src/modules/orders/paymentMethods/services/paymentMethodsService.js`
- `frontend/src/modules/orders/paymentMethods/hooks/usePaymentMethods.js`
- `frontend/src/modules/orders/paymentMethods/components/PaymentMethodsTable.jsx`
- `frontend/src/modules/orders/paymentMethods/components/PaymentMethodModal.jsx`

## Responsabilidades

- Buscar y filtrar por estado.
- Crear un metodo nuevo.
- Editar nombre o activar/desactivar.
- Eliminar con confirmacion.

## Reglas de UI

- `FilterTabs` separa `Todos`, `Activos`, `Inactivos`.
- El toggle de estado abre un `AppAlert` explicando el efecto.
- Los errores del backend se muestran sin ocultar el mensaje real.

## Diagrama

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart TD
    A[PaymentMethodsPage] --> B[Buscar o filtrar]
    A --> C[Abrir modal]
    A --> D[Toggle activo]
    C --> E[paymentMethodsService.create/updateState]
    D --> E
    E --> F[Refrescar listado]
```

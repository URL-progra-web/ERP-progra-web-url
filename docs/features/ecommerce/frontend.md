# Ecommerce - Frontend

## Objetivo

Documentar la experiencia publica de tienda: catalogo, producto, carrito y checkout.

## Archivos clave

- `frontend/src/App.jsx`
- `frontend/src/modules/public/layouts/PublicLayout.jsx`
- `frontend/src/modules/public/pages/CatalogPage.jsx`
- `frontend/src/modules/public/pages/ProductDetailPage.jsx`
- `frontend/src/modules/public/pages/CheckoutPage.jsx`
- `frontend/src/modules/public/hooks/useCart.js`
- `frontend/src/modules/public/services/publicService.js`
- `frontend/src/modules/public/components/CartDrawer.jsx`
- `frontend/src/modules/public/components/TurnstileWidget.jsx`

## Rutas publicas

- `/tienda`
- `/tienda/producto/:id`
- `/tienda/checkout`

## Flujo visible

### Catalogo

- Consulta productos, arbol de categorias, breadcrumb y filtros.
- Soporta busqueda, filtros por talla, color y rango de precio.

### Detalle de producto

- Carga variantes disponibles.
- Permite seleccionar variante y cantidad.
- Agrega al carrito local.

### Carrito

- Vive en `localStorage` (`erp_cart`).
- Se muestra en `CartDrawer`.
- Permite cambiar cantidades o remover items.

### Checkout

- Solicita nombre, telefono, email opcional, direccion y notas.
- Requiere completar Turnstile.
- Envia el pedido y limpia el carrito al responder exitosamente.

## Reglas de UI

- Si el carrito esta vacio, el checkout no se puede completar.
- El boton de envio se deshabilita sin token Turnstile.
- El mensaje de exito muestra `short_id`.

## Diagrama

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart TD
    A[/tienda] --> B[CatalogPage]
    B --> C[ProductDetailPage]
    C --> D[useCart localStorage]
    D --> E[CartDrawer]
    E --> F[/tienda/checkout]
    F --> G[CheckoutPage]
    G --> H[publicService.createOrder]
    H --> I[Pedido enviado]
```

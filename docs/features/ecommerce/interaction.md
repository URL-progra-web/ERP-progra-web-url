# Ecommerce - Interaccion Frontend y Backend

## Objetivo

Explicar el flujo completo de la tienda publica, desde el catalogo hasta la creacion del pedido.

## Payload tipico de checkout

```json
{
  "customer_name": "Juan Perez",
  "customer_phone": "+50255551234",
  "customer_email": "juan@example.com",
  "shipping_address": "Zona 10",
  "notes": "Entregar en recepcion",
  "turnstile_token": "token",
  "items": [
    {
      "variant_id": 7,
      "quantity": 2
    }
  ]
}
```

## Interaccion end-to-end

1. `CatalogPage` consulta productos, categorias y filtros del backend publico.
2. `ProductDetailPage` obtiene el detalle y agrega variantes al carrito local.
3. `CartDrawer` dirige al checkout.
4. `CheckoutPage` arma el payload y usa `publicService.createOrder(...)`.
5. `PublicOrderCreateView` valida Turnstile y el payload.
6. El backend busca o crea el `Customer` por telefono.
7. Se crea `Order` con estado `BORRADOR` y luego los `OrderItem`.
8. El backend devuelve `short_id` y el frontend muestra confirmacion.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant U as Usuario
    participant FE as Frontend Publico
    participant API as /api/public
    participant DB as DB

    U->>FE: Navega catalogo
    FE->>API: GET /products, /categories/tree, /filters
    API->>DB: Consultas de catalogo
    API-->>FE: Datos publicos

    U->>FE: Agrega variante al carrito
    FE->>FE: Guardar en localStorage

    U->>FE: Envia checkout
    FE->>API: POST /orders/
    API->>DB: Get or create customer
    API->>DB: Create order + items
    API-->>FE: short_id
    FE-->>U: Pantalla de exito
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart LR
    A[Catalogo] --> B[Detalle de producto]
    B --> C[Carrito local]
    C --> D[Checkout]
    D --> E[POST /api/public/orders]
    E --> F[(customers)]
    E --> G[(orders)]
    E --> H[(order_items)]
```

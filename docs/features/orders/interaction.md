# Orders - Interaccion Frontend y Backend

## Objetivo

Explicar el flujo completo del backoffice al crear y administrar pedidos.

## Payload tipico de creacion

```json
{
  "customer_id": 10,
  "payment_method_id": 2,
  "shipping_address": "Zona 1",
  "shipping_cost": 25,
  "notes": "Llamar antes de entregar",
  "items": [
    {
      "variant_id": 7,
      "quantity": 2,
      "selected_uom_id": 1
    }
  ]
}
```

## Interaccion end-to-end

1. `OrderCreatePage` carga catalogos de clientes y metodos de pago.
2. El usuario construye el carrito interno con variantes.
3. `orderService.create(payload)` llama a `POST /api/orders/`.
4. `OrderAPIView` decide si crea solo la cabecera o cabecera + items.
5. `OrderService` genera `short_id` y persiste la orden.
6. `OrderItemService` valida cada item y lo guarda.
7. El frontend navega al detalle de la nueva orden.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant U as Usuario ERP
    participant FE as Orders UI
    participant API as /api/orders
    participant S as OrderService
    participant IS as OrderItemService
    participant DB as DB

    U->>FE: Completa pedido
    FE->>API: POST /api/orders/
    API->>S: create_order_with_items
    S->>DB: Insert orders
    S->>IS: create_items_for_order
    IS->>DB: Insert order_items
    DB-->>API: Orden creada
    API-->>FE: OrderSerializer
    FE-->>U: Navegar a detalle
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart LR
    A[Frontend payload] --> B[OrderAPIView]
    B --> C[OrderService]
    C --> D[(orders)]
    C --> E[OrderItemService]
    E --> F[(order_items)]
    E --> G[Validacion UOM/stock/BU]
```

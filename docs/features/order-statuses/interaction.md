# Order Statuses - Interaccion Frontend y Backend

## Objetivo

Explicar como la UI usa el workflow del backend para ejecutar transiciones validas y con efecto en inventario.

## Payload de transicion

```json
{
  "order_id": 15,
  "target_status": "CONFIRMADO",
  "notes": "Validado por telefono"
}
```

## Interaccion end-to-end

1. El frontend consulta `GET /api/orders/statuses/transitions/`.
2. Con esa respuesta decide que acciones mostrar.
3. Al confirmar una accion, hace `POST /api/orders/statuses/transition/`.
4. `OrderStatusService.transition_order(...)` valida el salto.
5. Si aplica, genera movimientos de inventario y escribe historial.
6. El backend responde con `order_id`, `order_short_id` y nuevo estado.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant FE as OrderStatuses UI
    participant API as /api/orders/statuses
    participant S as OrderStatusService
    participant INV as InventoryTransactionService
    participant DB as DB

    FE->>API: GET /transitions/
    API-->>FE: workflow
    FE->>API: POST /transition/
    API->>S: transition_order
    S->>INV: aplicar salida o restauracion
    S->>DB: actualizar status + historial
    API-->>FE: nuevo estado
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart TD
    A[Frontend selecciona transicion] --> B[Backend valida workflow]
    B --> C{Es CONFIRMADO?}
    C -- Si --> D[Crear salidas de inventario]
    C -- No --> E{Es CANCELADO desde CONFIRMADO?}
    E -- Si --> F[Restaurar inventario]
    E -- No --> G[Sin movimiento de inventario]
    D --> H[Guardar historial]
    F --> H
    G --> H
```

# Payment Methods - Interaccion Frontend y Backend

## Objetivo

Explicar como el modulo visual administra un catalogo que luego es consumido por las ordenes.

## Interaccion end-to-end

1. `PaymentMethodsPage` consulta `GET /api/orders/payment-methods/`.
2. El usuario crea o edita desde `PaymentMethodModal`.
3. El frontend usa `POST` o `PATCH` segun la accion.
4. `PaymentMethodService` valida unicidad y restricciones.
5. Si el usuario intenta eliminar uno protegido o en uso, el backend lo rechaza.
6. La UI muestra el error y mantiene el estado anterior.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant FE as PaymentMethods UI
    participant API as /api/orders/payment-methods
    participant S as PaymentMethodService
    participant DB as payment_methods
    participant O as orders

    FE->>API: DELETE /{id}/
    API->>S: delete_method
    S->>DB: buscar metodo
    S->>O: validar uso en ordenes
    API-->>FE: 204 o error
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart LR
    A[Formulario o toggle] --> B[API payment-methods]
    B --> C[Validaciones de negocio]
    C --> D[(payment_methods)]
    D --> E[Catalogo de ordenes]
```

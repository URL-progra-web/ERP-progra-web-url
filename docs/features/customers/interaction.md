# Customers - Interaccion Frontend y Backend

## Objetivo

Explicar como el modulo CRM administra clientes y como esos registros alimentan pedidos internos y publicos.

## Interaccion end-to-end

1. `CustomersPage` lista clientes desde `/api/crm/customers/`.
2. `CustomerModal` crea o actualiza registros via `customerService`.
3. Desde la tabla se puede abrir `OrderModal` para crear un pedido asociado.
4. En ecommerce, `POST /api/public/orders/` puede reutilizar el mismo cliente por telefono.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant FE as Customers UI
    participant API as /api/crm/customers
    participant S as CustomerService
    participant DB as customers

    FE->>API: POST/PUT cliente
    API->>S: validar nombre, telefono y email
    S->>DB: insert/update
    API-->>FE: customer
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart LR
    A[CRM Customers] --> B[(customers)]
    B --> C[Backoffice Orders]
    B --> D[Public Ecommerce Checkout]
```

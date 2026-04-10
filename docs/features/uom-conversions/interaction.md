# UOM Conversions - Interaccion Frontend y Backend

## Objetivo

Explicar como el frontend administra conversiones y como el backend las valida antes de persistirlas.

## Interaccion end-to-end

1. `ConversionsTab` consulta `GET /api/inventory/uom-conversions/`.
2. El usuario puede filtrar por UOM origen y destino.
3. `ConversionModal` envia `POST` o `PUT` con `from_uom_id`, `to_uom_id`, `multiplier`.
4. `UomConversionService` valida reglas de negocio.
5. El backend persiste el registro y el frontend actualiza el tab.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant FE as ConversionsTab
    participant API as /api/inventory/uom-conversions
    participant S as UomConversionService
    participant DB as uom_conversions

    FE->>API: GET /
    API->>S: list_conversions
    S->>DB: select
    DB-->>FE: listado

    FE->>API: POST/PUT conversion
    API->>S: validar par y multiplier
    S->>DB: insert/update
    API-->>FE: conversion persistida
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart LR
    A[Frontend] --> B[API conversiones]
    B --> C[Reglas de validacion]
    C --> D[(uom_conversions)]
    D --> E[Uso posterior en ordenes e inventario]
```

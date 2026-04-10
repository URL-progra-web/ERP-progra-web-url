# UOMs - Interaccion Frontend y Backend

## Objetivo

Explicar como el modulo visual mantiene el catalogo de unidades de medida usando los endpoints de inventario.

## Interaccion end-to-end

1. `useUoms` llama `uomService.getUoms()`.
2. El backend devuelve el catalogo paginado.
3. El usuario crea o edita una UOM desde `UomModal`.
4. El frontend envia `POST` o `PUT` a `/api/inventory/uoms/`.
5. `UomService` valida unicidad y normaliza el codigo.
6. La UI refresca la tabla.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant FE as UOM UI
    participant API as /api/inventory/uoms
    participant S as UomService
    participant DB as uoms

    FE->>API: GET /
    API->>S: list_uoms
    S->>DB: select
    DB-->>FE: listado

    FE->>API: POST o PUT
    API->>S: create_uom o update_uom
    S->>DB: insert o update
    API-->>FE: registro
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart LR
    A[Modal] --> B[API UOMs]
    B --> C[Validacion code]
    C --> D[(uoms)]
    D --> E[Tabla refrescada]
```

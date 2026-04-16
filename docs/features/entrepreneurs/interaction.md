# Entrepreneurs - Interaccion Frontend y Backend

## Objetivo

Explicar como se administra el catalogo de emprendedores y como se vincula al ecosistema del ERP.

## Interaccion end-to-end

1. `EntrepreneursPage` consulta `/api/crm/entrepreneurs/`.
2. El hook tambien recupera usuarios disponibles con `/api/crm/entrepreneurs/users/`.
3. `EntrepreneurModal` envia los cambios al backend.
4. `EntrepreneurService` valida unicidad y existencia del usuario.
5. El registro resultante queda disponible para asociarse a productos.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant FE as Entrepreneurs UI
    participant API as /api/crm/entrepreneurs
    participant S as EntrepreneurService
    participant DB as entrepreneurs
    participant U as users

    FE->>API: GET /users/
    API-->>FE: opciones de usuario
    FE->>API: POST/PUT entrepreneur
    API->>S: validar payload
    S->>U: verificar user_id si existe
    S->>DB: insert/update
    API-->>FE: entrepreneur
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart LR
    A[Entrepreneurs UI] --> B[(entrepreneurs)]
    B --> C[(users)]
    B --> D[Productos publicos y backoffice]
```

# Login - Interaccion Frontend y Backend

## Objetivo

Explicar como ambas capas colaboran para abrir sesion, restaurarla y proteger rutas.

## Contrato principal

### Request

```json
{
  "email": "admin@erp.local",
  "password": "secret"
}
```

### Response exitosa

```json
{
  "refresh": "jwt-refresh",
  "access": "jwt-access",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@erp.local",
    "role": {
      "id": 1,
      "name": "ADMIN"
    }
  }
}
```

## Interaccion end-to-end

1. `Login.jsx` captura las credenciales.
2. `AuthContext.login` hace `POST /api/users/login/`.
3. `UserViewSet.login` valida al usuario.
4. El backend entrega tokens y datos del usuario.
5. El frontend guarda la sesion en `localStorage`.
6. En el arranque, `AuthContext` hace `GET /api/users/users/me/` con el token.
7. Si falla la validacion, el frontend limpia sesion y fuerza nuevo login.

## Diagramas

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#dbeafe','primaryTextColor':'#0f172a','primaryBorderColor':'#2563eb',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','mainBkg':'#e2e8f0',
  'secondBkg':'#dcfce7','tertiaryBkg':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
sequenceDiagram
    participant U as Usuario
    participant FE as Login/AuthContext
    participant API as /api/users
    participant DB as users + roles

    U->>FE: Envia email y password
    FE->>API: POST /login/
    API->>DB: Validar usuario y hash
    DB-->>API: Usuario valido
    API-->>FE: access + refresh + user
    FE->>FE: Guardar sesion local
    FE-->>U: Redirigir a dashboard
```

```mermaid
%%{init: {'theme':'base','themeVariables': {
  'background':'transparent','primaryColor':'#e2e8f0','primaryTextColor':'#0f172a','primaryBorderColor':'#475569',
  'lineColor':'#475569','secondaryColor':'#dcfce7','tertiaryColor':'#fef3c7','clusterBkg':'#f8fafc','clusterBorder':'#94a3b8'
}}}%%
flowchart TD
    A[App carga] --> B{Hay access_token}
    B -- No --> C[Seguir sin sesion]
    B -- Si --> D[GET /users/users/me/]
    D --> E{Token valido}
    E -- Si --> F[Restaurar user]
    E -- No --> G[Limpiar localStorage]
```

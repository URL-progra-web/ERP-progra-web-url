# ERP para Microempresas

ERP modular diseñado para microempresas, con soporte para Punto de Venta, Gestión de Inventario y Recursos Humanos. Construido con React (Vite) y Django REST Framework, siguiendo principios de Screaming Architecture.

## Primeros Pasos

Puedes ejecutar la aplicación usando Docker (recomendado para consistencia) o de manera local.

### Opción 1: Ejecutar con Docker (Recomendado)

Requiere Docker y Docker Compose.

1. Crear archivos de entorno:
   - `cp backend/.env.example backend/.env`
   - `cp frontend/.env.example frontend/.env`
2. Ejecutar la aplicación:
   ```bash
   docker-compose up --build
   ```
3. La API del backend está en `http://localhost:8000`
4. La UI del frontend está en `http://localhost:5173`

*(Nota: Ejecuta `docker-compose exec backend python manage.py migrate` la primera vez para configurar la base de datos.)*
*(Nota: Ejecuta `docker compose exec frontend npx shadcn@latest init` para inicializar shadcn/ui en el frontend.)*

---

### Opción 2: Ejecutar Localmente

Requiere Python 3.12+, Node.js 18+ y PostgreSQL.

**1. Configurar la base de datos:**
Crea el archivo `backend/.env` basado en `.env.example` y configura PostgreSQL:
```bash
cp backend/.env.example backend/.env
# Edita el archivo con tus credenciales de PostgreSQL
```

**2. Iniciar el Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**2. Iniciar el Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## Agregar Componentes shadcn/ui

El proyecto usa [shadcn/ui](https://ui.shadcn.com) para los componentes de UI.

### En Docker

1. Entra al contenedor del frontend:
   ```bash
   docker-compose exec frontend sh
   ```

2. Agrega el componente:
   ```bash
   npx shadcn@latest add [componente]
   ```
   Ejemplo: `npx shadcn@latest add button`

3. Importa el componente en tu código:
   ```jsx
   import { Button } from "@/components/ui/button"
   ```

### Localmente

1. En la raíz del proyecto frontend:
   ```bash
   cd frontend
   npx shadcn@latest add [componente]
   ```

2. Importa el componente en tu código:
   ```jsx
   import { Button } from "@/components/ui/button"
   ```

---

## Arquitectura

Usamos **Screaming Architecture**. Tanto el frontend como el backend están dividos en módulos de características explícitas:
- `pos` (Punto de Venta)
- `inventory` (Inventario)
- `hr` (Recursos Humanos)
- `users` (Usuarios y Auth)

Dentro de cada característica encontrarás `models`, `repositories`, `services`, `routers/components`.

---

## Autenticación y Pruebas API (Swagger)

El proyecto cuenta con un módulo de Usuarios configurado y expuesto en `/api/v1/users/`.
Además, incluye documentación Swagger instalada (mediante `drf_spectacular`) para probar la API visualmente.

1. Ingresa a la interfaz de Swagger en [http://localhost:8000/api/v1/docs/](http://localhost:8000/api/v1/docs/)
2. Todos los endpoints de usuarios requieren permisos de Administrador (`is_staff`). Puedes crear un superusuario si aún no lo tienes:
   ```bash
   docker compose exec backend python manage.py createsuperuser
   ```
3. Para obtener el Token de acceso JWT en **Postman** (o crear un request de cURL), realiza un `POST` a `/api/v1/token/` con tu email y contraseña:
   
   **Usando cURL**:
   ```bash
   curl -X POST http://localhost:8000/api/v1/token/ \
        -H "Content-Type: application/json" \
        -d '{"email": "tuemail@admin.com", "password": "tusuperpassword"}'
   ```
   
   **Usando Postman**:
   Crea un nuevo request tipo `POST` hacia `http://localhost:8000/api/v1/token/`. En la pestaña **Body** selecciona *raw -> JSON* y usa:
   ```json
   {
     "email": "tuemail@admin.com",
     "password": "tusuperpassword"
   }
   ```

4. Copia el token de `"access"` y colócalo en tu request usando el Authorization header (`Bearer <tu-token>`). 
   - **Para Swagger:** Dale clic al botón **Authorize** en la esquina superior derecha y pégalo allí.
   - **Para Postman:** Ve a la pestaña **Auth**, elige el tipo **Bearer Token**, y pega el token de acceso.
   - **Para cURL:**
     ```bash
     curl -X GET http://localhost:8000/api/v1/users/ \
          -H "Authorization: Bearer <TU-TOKEN-AQUI>"
     ```

**Paginación (Aplica para todo el proyecto)**
Todos los endpoints que devuelven listados (ej. `GET /api/v1/users/`, `GET /api/v1/products/`, etc.) auto-aplican paginación siguiendo un patrón estandarizado (10 ítems por página por defecto). 

Para navegar por los resultados, simplemente añade y modifica la query param `page`:
- `GET /api/v1/users/?page=1` (Página 1)
- `GET /api/v1/users/?page=2` (Página 2)

Las respuestas de los listados siempre tendrán la misma estructura:
```json
{
  "count": 55,
  "next": "http://localhost:8000/api/v1/users/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

# ERP Progra Web

Sistema ERP moderno con backend Django REST Framework y frontend React + Vite.

## Tecnologias

- **Backend**: Django 4.2+, Django REST Framework, PostgreSQL
- **Frontend**: React 19, Vite, React Router, Bootstrap
- **Contenedores**: Docker, Docker Compose

## Requisitos Previos

- Docker y Docker Compose
- Opcional (para desarrollo local sin Docker):
  - Python 3.12+
  - Node.js 22+
  - PostgreSQL 17+

---

## Ejecucion con Docker (Recomendado)

```bash
# Levantar todos los servicios
docker-compose up --build

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

**Servicios disponibles:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api
- PostgreSQL: localhost:5432

---

## Ejecucion Local (Sin Docker)

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
export POSTGRES_DB=erp_db
export POSTGRES_USER=erp_user
export POSTGRES_PASSWORD=erp_password
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432

# Ejecutar migraciones
python manage.py migrate

# Iniciar servidor
python manage.py runserver
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
```

---

## Estructura del Proyecto

```
ERP-progra-web-url/
├── backend/                 # Django REST Framework
│   ├── backend/            # Configuracion principal
│   ├── users/              # Modulo de usuarios y roles
│   ├── products/           # Catalogo de productos
│   ├── orders/             # Gestion de pedidos
│   ├── inventory/          # Control de inventario
│   ├── crm/                # Gestion de clientes
│   ├── manage.py
│   └── requirements.txt
├── frontend/               # React + Vite
│   ├── src/
│   │   ├── core/           # Componentes共享 (layouts, auth, registry)
│   │   ├── modules/         # Modulos por feature
│   │   │   ├── users/      # Ejemplo: modulo de usuarios
│   │   │   ├── Overview/
│   │   │   └── Auth/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
└── README.md
```

---

## Rutas del Backend (API)

| Prefijo | Modulo | Endpoints |
|---------|--------|-----------|
| `/api/users/` | Usuarios y autenticacion | `login/`, `users/`, `roles/` |
| `/api/products/` | Productos | (en desarrollo) |
| `/api/orders/` | Pedidos | `payment-methods/`, `statuses/`, `statuses/transition/` |
| `/api/inventory/` | Inventario | (en desarrollo) |
| `/api/crm/` | CRM | `customers/` |

### Endpoints de Usuarios

- `POST /api/users/login/` - Autenticacion
- `GET /api/users/users/` - Listar usuarios
- `POST /api/users/users/` - Crear usuario
- `GET /api/users/users/{id}/` - Ver usuario
- `PUT /api/users/users/{id}/` - Actualizar usuario
- `PATCH /api/users/users/{id}/toggle_active/` - Activar/desactivar
- `GET /api/users/roles/` - Listar roles

### Endpoints de Pedidos

- `GET /api/orders/payment-methods/` - Listar metodos de pago (`search`, `is_active`)
- `POST /api/orders/payment-methods/` - Crear metodo de pago
- `PUT /api/orders/payment-methods/{id}/` - Actualizar metodo de pago
- `POST /api/orders/payment-methods/{id}/activate|deactivate/` - Cambiar estado activo
- `DELETE /api/orders/payment-methods/{id}/` - Eliminar si no hay pedidos asociados
- `GET /api/orders/statuses/` - Listar estatus configurados
- `POST /api/orders/statuses/` - Crear estatus
- `PUT /api/orders/statuses/{id}/` - Actualizar estatus
- `DELETE /api/orders/statuses/{id}/` - Eliminar estatus no usados
- `GET /api/orders/statuses/transitions/` - Ver flujo permitido
- `POST /api/orders/statuses/transition/` - Avanzar pedido (`order_id`, `target_status`, `notes`)

### Endpoints de CRM

- `GET /api/crm/customers/` - Listar clientes invitados (`search`, `created_from`, `created_to`)
- `POST /api/crm/customers/` - Crear cliente
- `GET /api/crm/customers/{id}/` - Detalle
- `PUT /api/crm/customers/{id}/` - Actualizar datos
- `DELETE /api/crm/customers/{id}/` - Eliminar cliente

---

## Rutas del Frontend

El frontend usa un sistema de rutas dinamicas basado en roles:

| Rol | Ruta Base | Permisos |
|-----|-----------|----------|
| ADMIN | `/dashboard/admin` | Acceso total |
| MANAGER | `/dashboard/manager` | Admin + Manager |
| VISITOR | `/dashboard/visitor` | Todos los roles |

### Rutas Existentes

- `/login` - Pagina de login
- `/dashboard/admin` - Dashboard admin
- `/dashboard/admin/users` - Gestion de usuarios
- `/dashboard/manager` - Dashboard manager
- `/dashboard/visitor` - Dashboard visitante
- `/404` - Pagina no encontrada
- `/forbidden` - Acceso denegado

---

## Como Crear Nuevos Modulos (Frontend)

### 1. Estructura de un Modulo

```
src/modules/nombre_modulo/
├── components/         # Componentes reutilizables
│   └── MiComponente.jsx
├── pages/             # Vistas/paginas
│   └── MiPagina.jsx
├── services/          # Llamadas API
│   └── miServicio.js
├── hooks/            # Custom hooks
│   └── useMiModulo.js
├── nombre_modulo.config.jsx   # Configuracion del modulo
├── nombre_modulo.mocks.js     # Datos de prueba
└── nombre_modulo.test.js      # Tests (opcional)
```

### 2. Definir el Config (users.config.jsx como referencia)

```jsx
import React from 'react';
import { FiIcon } from 'react-icons/fi';
import MiPagina from './pages/MiPagina';

export const miModuloFeature = {
    id: 'mi_modulo',
    group: 'Nombre del Grupo en Sidebar',
    items: [
        {
            text: 'Texto del Menu',
            path: 'ruta-relativa',  // se concatena al dashboard
            icon: FiIcon,
            roles: ['ADMIN', 'MANAGER'],  // roles que ven esta opcion
            element: <MiPagina />
        }
    ]
};
```

### 3. Registrar el Modulo

Editar `src/core/registry/index.js`:

```jsx
import { miModuloFeature } from '../../modules/mi_modulo/mi_modulo.config';

export const REGISTERED_FEATURES = [
    usersFeature,
    miModuloFeature,  // Agregar aqui
];
```

### 4. CrearMocks (users.mocks.js como referencia)

```jsx
export const miModuloMocks = {
    mi_entidad: [
        { id: 1, nombre: 'Item 1', estado: 'activo' },
        { id: 2, nombre: 'Item 2', estado: 'inactivo' },
    ],
    // Otros datos de prueba...
};
```

### 5. Registrar Mocks

Editar `src/core/registry/mockRegistry.js`:

```jsx
import { miModuloMocks } from '../../modules/mi_modulo/mi_modulo.mocks';

export const ALL_MOCKS = {
    ...usersMocks,
    ...miModuloMocks,  // Agregar aqui
};
```

### 6. Crear Servicio API (userService.js como referencia)

```javascript
import api from '../../../core/api/api';

export const miServicio = {
    getItems: async (params = {}) => {
        const response = await api.get('/ruta/api/', { params });
        return response.data;
    },
    
    createItem: async (data) => {
        const response = await api.post('/ruta/api/', data);
        return response.data;
    },
    
    updateItem: async (id, data) => {
        const response = await api.put(`/ruta/api/${id}/`, data);
        return response.data;
    },
    
    deleteItem: async (id) => {
        const response = await api.delete(`/ruta/api/${id}/`);
        return response.data;
    }
};
```

---

## Como Crear Nuevos Endpoints (Backend)

### Estructura de un Modulo Django

```
backend/nombre_app/
├── models/
│   └── models.py         # Modelos de base de datos
├── repositories/
│   └── repositories.py   # Acceso a datos
├── services/
│   └── services.py       # Logica de negocio
├── serializers/
│   └── serializers.py    # Serializacion DRF
├── apis/
│   └── views.py          # Vistas/ViewSets
├── exceptions.py         # Excepciones personalizadas
├── urls.py               # Rutas del modulo
└── __init__.py
```

### Ejemplo: Crear un nuevo ViewSet

```python
# nombre_app/apis/views.py
from rest_framework import viewsets
from nombre_app.serializers.serializers import MiModeloSerializer
from nombre_app.services.services import MiModeloService

class MiModeloViewSet(viewsets.ModelViewSet):
    serializer_class = MiModeloSerializer
    service = MiModeloService()
    
    def get_queryset(self):
        return self.service.get_all()
    
    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.service.create(serializer.validated_data)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
```

### Registrar Rutas

```python
# nombre_app/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from nombre_app.apis.views import MiModeloViewSet

router = DefaultRouter()
router.register(r'', MiModeloViewSet, basename='mimodelo')

urlpatterns = [
    path('', include(router.urls)),
]
```

Agregar al `backend/urls.py` principal:

```python
path('api/nombre_app/', include('nombre_app.urls')),
```

---

## Configuracion de Variables de Entorno

### Backend (Docker)

El backend usa las variables definidas en `docker-compose.yml`:
- `POSTGRES_DB`: erp_db
- `POSTGRES_USER`: erp_user
- `POSTGRES_PASSWORD`: erp_password
- `POSTGRES_HOST`: db
- `POSTGRES_PORT`: 5432

### Frontend (Docker)

- `VITE_API_URL`: http://localhost:8000/api

---

## Comandos Utiles

### Backend

```bash
# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear superusuario
python manage.py createsuperuser

# Ejecutar seed de usuarios
python seed_users.py
```

### Frontend

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build produccion
npm run build

# Lint
npm run lint
```

---

## Notas Adicionales

- El proyecto usa JWT para autenticacion
- El frontend implementa un sistema de rutas dinamicas por roles
- Los mocks se pueden usar para desarrollo sin backend
- La estructura del backend sigue el patron Repository + Service

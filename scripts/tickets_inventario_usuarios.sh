#!/bin/bash

if ! command -v gh &> /dev/null
then
    echo "GitHub CLI (gh) no esta instalado. Por favor instalalo primero."
    exit 1
fi

# ==========================================
# CREACION DE LABELS
# ==========================================
# echo "Asegurando que existan las etiquetas en el repositorio..."
# LABELS=("backend" "frontend" "warehouse" "category" "product" "inventory" "enhancement" "auth")

# for label in "${LABELS[@]}"; do
#     # Intenta crear la etiqueta, ignorando el error si ya existe
#     gh label create "$label" --force 2>/dev/null || true
# done

# ==========================================
# CONFIGURACION
# ==========================================
PROJECT_NUMBER="Modulo de Inventarios" 

PROJECT_FLAG=()
if [ -n "$PROJECT_NUMBER" ]; then
    PROJECT_FLAG=(--project "$PROJECT_NUMBER")
fi

echo "Creando todos los tickets del sistema de inventario con descripciones detalladas..."

# ==========================================
# USER (Usuarios - PROYECTO 4)
# ==========================================
PROJECT_NUMBER="Modulo de usuarios"
PROJECT_FLAG=()
if [ -n "$PROJECT_NUMBER" ]; then
    PROJECT_FLAG=(--project "$PROJECT_NUMBER")
fi

TITLE_9="[Backend] Modelo de Usuario, Roles y JWT"
BODY_9=$(cat << 'EOF'
### Que vas a programar
Objetivo: Configurar el modelo de usuario, sistema de permisos base y emision de tokens.

### Estructuras y Logica de Negocio
* **Modelo**: Configurar modelo personalizado heredando de `AbstractUser` agregando el campo `phone`.
* **Autenticacion**: Integrar `djangorestframework-simplejwt` para manejar acceso basado en tokens de corta duracion (Access) y larga duracion (Refresh).
* **Endpoints**: 
  - `POST /auth/login/`: Retorna `{ "access": "jwt...", "refresh": "jwt..." }`.
  - `POST /auth/refresh/`: Recibe un refresh token y retorna un nuevo access token.
  - `GET /auth/me/`: Retorna el perfil completo del usuario decodificando el token actual `{ "id": 1, "username": "", "first_name": "", "is_superuser": false }`.
* **Roles y Permisos (Sistema Futuro)**: Actualmente solo usaremos `is_superuser`. Sin embargo, desde ya se deben implementar funciones/decoradores (ej. una clase o función similar a `has_role(x)`) para validar permisos en las vistas, preparándolo para el futuro. No definiremos roles fijos ahora.
* **Blacklist de Tokens (Opcional)**: En caso de requerir un logout contundente que invalide los JWT, configurar la app de token_blacklist de simplejwt como prioridad muy baja (para el final).
* **Middleware**: Implementar `JWTAuthMiddleware` para validar el token en cada request.

### Criterios de Aceptacion (Checklist)
- [ ] AUTH_USER_MODEL configurado en Django settings.
- [ ] Endpoint /refresh/ configurado en las URLs.
- [ ] Funciones/Mecanismos de validación `has_role(x)` estructuradas.
EOF
)
gh issue create --title "$TITLE_9" --body "$BODY_9" --label "backend" --label "auth" "${PROJECT_FLAG[@]}"

TITLE_10="[Frontend] Login, Guardias de Ruta y Almacenamiento de Token"
BODY_10=$(cat << 'EOF'
### Que vas a programar
Objetivo: Pantalla de login, contexto de autenticacion global y proteccion de navegacion en React.

### Estructuras y Logica de Negocio
* **Pantalla de Login**: Formulario con username y password. 
* **Auth Context y Seguridad**: Al tener exito, almacenar el `access_token` en memoria dinámica (React Context). De requerirse retención, configurar el backend para retornar el `refresh_token` como una cookie `HttpOnly` (mitigando ataques de XSS). Luego llamar a `/auth/me/` para guardar los datos en Contexto.
* **Router Guards**: Crear `<ProtectedRoute>`. Si no hay credenciales activas, redirigir a `/login`.
* **Axios / Fetch Interceptor (Manejo de 401)**: 
  - *Request Interceptor*: Inyectar `Authorization: Bearer <token>` en cada petición.
  - *Response Interceptor*: Capturar errores `401 Unauthorized`. Si ocurre, de forma transparente intentar invocar `/auth/refresh/` con el refresh token (vía cookie). Si hay exito, reintentar la peticion fallida. Si vuelve a fallar, desconectar y mandar a `/login`.

### Criterios de Aceptacion (Checklist)
- [ ] Interceptor de red inteligente (refresh de token automático) implementado.
- [ ] Seguridad mejorada almacenando estado sensitivo en Context y Cookies.
- [ ] Rutas privadas protegidas contra acceso de anonimos.
EOF
)
gh issue create --title "$TITLE_10" --body "$BODY_10" --label "frontend" --label "auth" "${PROJECT_FLAG[@]}"

# ==========================================
# CONFIGURACION PARA INVENTARIO
# ==========================================
PROJECT_NUMBER="Modulo de Inventarios" 
PROJECT_FLAG=()
if [ -n "$PROJECT_NUMBER" ]; then
    PROJECT_FLAG=(--project "$PROJECT_NUMBER")
fi

# ==========================================
# WAREHOUSE (Bodegas)
# ==========================================
TITLE_1="[Backend] CRUD de Bodegas (Warehouse)"
BODY_1=$(cat << 'EOF'
### Que vas a programar
Objetivo: Implementar los endpoints REST para la gestion de bodegas, asegurando la inyeccion de dependencias con WarehouseRepository y WarehouseService.

### Estructuras y Logica de Negocio
* **POST /warehouses/**: Debe recibir el payload `{ "name": "string", "code": "string", "address": "string", "is_active": boolean }`. El Service debe validar que el `code` no exista previamente.
* **GET /warehouses/**: Debe retornar una lista plana de bodegas. Debe aceptar un query param `?is_active=true` para filtrar solo las operativas (util para los dropdowns del frontend).
* **PATCH /warehouses/{id}/**: Para actualizaciones parciales.
* **DELETE /warehouses/{id}/**: Soft delete. El Service no debe borrar el registro de BD, solo pasar `is_active` a `False`. *Regla futura:* Validar que no tenga stock > 0 antes de desactivar.

### Criterios de Aceptacion (Checklist)
- [ ] Modelo Warehouse importado en models/__init__.py.
- [ ] WarehouseRepository implementa metodos de acceso a datos.
- [ ] WarehouseService maneja la logica de validacion de codigo unico y soft-delete.
- [ ] Endpoints protegidos para usuarios autenticados.
EOF
)
gh issue create --title "$TITLE_1" --body "$BODY_1" --label "backend" --label "warehouse" "${PROJECT_FLAG[@]}"

TITLE_2="[Frontend] Gestion de Bodegas UI"
BODY_2=$(cat << 'EOF'
### Que vas a programar
Objetivo: Vistas en React para listar, crear y editar Bodegas consumiendo la API de Django.

### Estructuras y Logica de Negocio
* **Vista de Listado**: Implementar una tabla (DataGrid) que muestre las columnas: Nombre, Codigo, Direccion y Estado (Chip verde para activo, gris para inactivo).
* **Acciones**: Botones de Editar y Desactivar por cada fila.
* **Formulario (Crear/Editar)**: Debe contener inputs para `name` (texto), `code` (texto sin espacios), `address` (textarea) y un switch/checkbox para `is_active`.
* **Manejo de estado**: El formulario debe capturar el error 400 del backend si el `code` ya existe y marcar el input en rojo con el mensaje correspondiente.

### Criterios de Aceptacion (Checklist)
- [ ] Componente de tabla conectado al endpoint GET /warehouses/.
- [ ] Formulario de creacion/edicion manejando el estado correctamente.
- [ ] Manejo visual de errores de validacion provenientes del backend.
EOF
)
gh issue create --title "$TITLE_2" --body "$BODY_2" --label "frontend" --label "warehouse" "${PROJECT_FLAG[@]}"

# ==========================================
# CATEGORY (Categorias Recursivas)
# ==========================================
TITLE_3="[Backend] CRUD de Categorias (Arbol Infinito)"
BODY_3=$(cat << 'EOF'
### Que vas a programar
Objetivo: Endpoints para gestionar categorias soportando una jerarquia recursiva infinita mediante el campo `parent_id`.

### Estructuras y Logica de Negocio
* **GET /categories/tree/**: Debe retornar TODAS las categorias estructuradas como un arbol anidado JSON. Ejemplo de nodo: `{ "id": 1, "name": "Ferreteria", "children": [ { "id": 2, "name": "Clavos", "children": [] } ] }`.
* **GET /categories/{id}/children/**: Debe retornar una lista plana unicamente con los hijos directos de un nodo especifico.
* **GET /categories/{id}/children/tree/**: Debe retornar la misma estructura que el endpoint `tree`, pero filtrada por el `id` del nodo especifico.
* **POST /categories/**: Recibe payload `{ "name": "string", "description": "string", "parent_id": integer|null }`. 
* **Servicio (CategoryService)**: Debe generar automaticamente el `slug` a partir del `name`. Al hacer un PATCH de `parent_id`, debe validar que el nuevo padre no sea hijo o descendiente de la categoria actual (prevenir referencias circulares).

### Criterios de Aceptacion (Checklist)
- [ ] Modelo Category expuesto en models/__init__.py.
- [ ] CategoryService con logica de prevencion de ciclos y autogeneracion de slug.
- [ ] Endpoints construidos (Tree view y Listado plano de hijos).
EOF
)
gh issue create --title "$TITLE_3" --body "$BODY_3" --label "backend" --label "category" "${PROJECT_FLAG[@]}"

TITLE_4="[Frontend] Arbol de Categorias UI"
BODY_4=$(cat << 'EOF'
### Que vas a programar
Objetivo: Interfaz en React para administrar la jerarquia de categorias.

### Estructuras y Logica de Negocio
* **Vista Principal**: Renderizar la respuesta de `/categories/tree/` usando un componente TreeView (nodos colapsables). Cada nodo debe tener botones "+" (agregar hijo) y "Editar".
* **Formulario de Creacion**: Recibe `name` y `description`. Debe incluir un Dropdown (Select) para elegir el `parent_id`. Este Select debe consumir la lista plana de categorias para que el usuario pueda buscar/seleccionar el padre. Si el usuario dio clic en el "+" de un nodo del arbol, el dropdown de padre ya debe venir preseleccionado.
* **Componente reutilizable**: El TreeView debe ser reutilizable para otros componentes que necesiten mostrar una jerarquia de nodos, debe poder ser seleccionable y retornar el ID del item seleccionado.

### Criterios de Aceptacion (Checklist)
- [ ] TreeView implementado y consumiendo el endpoint de arbol.
- [ ] Formulario de categorias con autocompletado/dropdown para seleccionar el parent_id.
- [ ] Al guardar exitosamente, el TreeView debe refrescar su estado para mostrar el nuevo nodo.
EOF
)
gh issue create --title "$TITLE_4" --body "$BODY_4" --label "frontend" --label "category" "${PROJECT_FLAG[@]}"

# ==========================================
# PRODUCT (Productos)
# ==========================================
TITLE_5="[Backend] CRUD de Productos"
BODY_5=$(cat << 'EOF'
### Que vas a programar
Objetivo: API para la gestion del catalogo de productos y sus niveles de stock requeridos.

### Estructuras y Logica de Negocio
* **POST /products/**: Payload esperado: `{ "name": "", "code": "", "description": "", "unit": "", "sale_price": decimal, "cost_price": decimal, "stock_minimo": integer, "category_id": integer, "is_active": boolean }`.
* **Servicio (ProductService)**: Validar que `sale_price` > `cost_price`. Validar que `stock_minimo` >= 0.
* **GET /products/**: El Serializer de lectura no solo debe retornar el `category_id`, sino un objeto anidado `{ "id": 1, "name": "Nombre Categoria" }` para facilitar la renderizacion en el frontend.
* Implementar busqueda (search) por `name` y `code`, y filtrado exacto por `category_id`.

### Criterios de Aceptacion (Checklist)
- [ ] Modelo Product importado correctamente.
- [ ] ProductService manejando validaciones de negocio de precios.
- [ ] Serializers separados: Uno para escritura (acepta IDs) y otro para lectura (retorna diccionarios anidados de categoria).
- [ ] Endpoints soportan filtros y busqueda.
EOF
)
gh issue create --title "$TITLE_5" --body "$BODY_5" --label "backend" --label "product" "${PROJECT_FLAG[@]}"

TITLE_6="[Frontend] Catalogo de Productos UI"
BODY_6=$(cat << 'EOF'
### Que vas a programar
Objetivo: UI en React para administrar el catalogo completo de productos.

### Estructuras y Logica de Negocio
* **Vista de Listado**: Tabla con paginacion manejada desde el servidor. Columnas: Codigo, Nombre, Categoria, Precio Venta, Stock Minimo.
* **Buscador**: Input de texto arriba de la tabla que haga un "debounce" y dispare la busqueda por codigo/nombre hacia la API.
* **Formulario**: Inputs de texto y numericos para los campos del producto. Para la `category_id`, implementar un selector que consuma la API de categorias.
* **Validacion de cliente**: Prevenir el submit si el Precio de Costo es mayor al Precio de Venta.

### Criterios de Aceptacion (Checklist)
- [ ] Pantalla de listado con buscador por texto y filtro por categoria.
- [ ] Paginacion server-side conectada a la tabla.
- [ ] Formulario completo con validaciones logicas de precios y existencias.
EOF
)
gh issue create --title "$TITLE_6" --body "$BODY_6" --label "frontend" --label "product" "${PROJECT_FLAG[@]}"

# ==========================================
# MOVEMENT_TYPE & MOVEMENT (Entradas/Salidas Manuales)
# ==========================================
TITLE_7="[Backend] Registro de Movimientos Manuales (Entradas/Salidas)"
BODY_7=$(cat << 'EOF'
### Que vas a programar
Objetivo: Core de logica de inventario para ingresos y egresos (ajustes, compras, mermas).

### Estructuras y Logica de Negocio
* **POST /movements/**: Recibe un array de items para procesar en lote (batch). Payload: `{ "to_warehouse_id": int, "movement_type_id": int, "reference": string, "notes": string, "items": [ { "product_id": int, "quantity": int } ] }`. Nota: si es entrada/salida manual, `from_warehouse_id` puede ser nulo o ignorado.
* **Servicio (MovementService)**: 
  1. Consultar el `direction` ('IN' o 'OUT') basado en el `movement_type_id`.
  2. Iterar sobre todos los `items` y llamar a `StockRepository.update_stock(product, warehouse, quantity)`. Si es IN, suma; si es OUT, resta.
  3. Todo el batch debe ir en un mismo bloque `with transaction.atomic():`.
  4. Extraer el usuario autenticado del request y guardarlo en `created_by_id`.
  5. Si es OUT, validar en BD que `stock_actual >= quantity` para cada item antes de ejecutar la transaccion.
  6. **Costo Promedio (Nota):** Preguntar al ingeniero principal si se requiere recalcular el costo promedio del producto en las entradas (IN). Preferiblemente mantenerlo simple por ahora, ya que NO se esta haciendo un kardex contable o financiero completo.
  7. Retornar en el payload `{"status": "success", "low_stock_alerts": [product_id_1, product_id_2]}` listando los productos que cayeron por debajo del minimo.

### Criterios de Aceptacion (Checklist)
- [ ] Endpoint soporta payload de multiples items (batch).
- [ ] StockRepository usando .select_for_update() para bloquear filas de BD concurrentes.
- [ ] MovementService manejando la transaccion atómica completa.
- [ ] Validacion estricta de stock negativo.
- [ ] Asignacion automatica del usuario que registra el movimiento.
EOF
)
gh issue create --title "$TITLE_7" --body "$BODY_7" --label "backend" --label "inventory" "${PROJECT_FLAG[@]}"

TITLE_8="[Frontend] Registro de Movimientos Manuales UI"
BODY_8=$(cat << 'EOF'
### Que vas a programar
Objetivo: Formulario en React para que los usuarios registren entradas o salidas de inventario por ajuste.

### Estructuras y Logica de Negocio
* **Formulario Dinamico (Estilo Carrito)**:
  - Generales del movimiento: Selector de "Tipo de Movimiento", Selector de Bodega, Referencia y Notas.
  - El usuario debe poder ir agregando productos a una especie de "carrito" o grilla antes de enviar al servidor (submit en batch).
  - Para agregar al carrito: Buscador autocompletable de Producto e input numerico de Cantidad (mayor a 0).
* **Logica de UI**: Si el endpoint retorna `low_stock_alerts` con IDs tras guardar exitosamente, mostrar un Toast/Notificacion permanente advirtiendo sobre el/los productos especificos que llegaron a su nivel minimo.

### Criterios de Aceptacion (Checklist)
- [ ] Formulario construido y validando cantidad > 0.
- [ ] Buscadores de producto y bodega conectados a sus respectivos endpoints activos.
- [ ] Alertas visuales de error manejadas (ej. El backend responde: "Stock insuficiente").
- [ ] Manejo de la advertencia de stock minimo tras respuesta exitosa.
EOF
)
gh issue create --title "$TITLE_8" --body "$BODY_8" --label "frontend" --label "inventory" "${PROJECT_FLAG[@]}"

# ==========================================
# BACKEND & FRONTEND - Transferencias
# ==========================================
TITLE_11="[Backend] Transferencia de Inventario entre Sucursales"
BODY_11=$(cat << 'EOF'
### Que vas a programar
Objetivo: Implementar endpoint especifico para mover mercaderia de una bodega a otra.

### Estructuras y Logica de Negocio
* **POST /movements/transfer/**: Payload en batch: `{ "from_warehouse_id": int, "to_warehouse_id": int, "reference": string, "items": [ { "product_id": int, "quantity": int } ] }`.
* **Servicio (InventoryTransferService)**:
  1. Validar que `from_warehouse_id` != `to_warehouse_id`.
  2. Iniciar `transaction.atomic()`.
  3. Iterar cada item: restar `quantity` del stock en `from_warehouse_id`. Fallar si no hay stock suficiente para alguno.
  4. Sumar `quantity` al stock en `to_warehouse_id` (crear el registro de stock si no existe para esa bodega).
  5. Crear el/los registros en tabla `movement` usando el tipo de movimiento interno de transferencia.
  6. **Transferencias Directas (Decision de Diseno):** Nota explícita: La transacción es O o 1. Las cantidades se mueven de inmediato sin estado temporal de "En Transito". Si despues se requieren estados fisicos en los despachos, se hara una migracion a futuro.
  7. Retornar si la bodega de origen quedo bajo el stock minimo en algun item.

### Criterios de Aceptacion (Checklist)
- [ ] Endpoint /transfer/ soporta multiples items (batch).
- [ ] Endpoint inyectando TransferService y procesando la logica.
- [ ] Transaccion atomica validando origen y destino con bloqueos de fila select_for_update().
- [ ] Creacion de registros de stock on-the-fly si el producto nunca habia estado en la bodega destino.
EOF
)
gh issue create --title "$TITLE_11" --body "$BODY_11" --label "backend" --label "enhancement" "${PROJECT_FLAG[@]}"

TITLE_12="[Frontend] Pantalla de Transferencia de Sucursales"
BODY_12=$(cat << 'EOF'
### Que vas a programar
Objetivo: UI dedicada en React para ejecutar transferencias rapidas de stock.

### Estructuras y Logica de Negocio
* **Vista (Carrito de Transferencias)**: Un formulario de lado a lado (origen a destino) donde se agregan items.
* **Campos Generales**: Bodega Origen (Select), Bodega Destino (Select).
* **Carrito/Grilla**: Producto (Buscador alineado a Bodega Origen) y Cantidad a transferir (Number).
* **Validaciones de UI - CRITICO**: 
  1. Al seleccionar un producto para agregar al carrito, la UI debe mostrar visualmente el stock disponible que hay en la Bodega Origen, y bloquear la adicion si la cantidad solicitada supera dicho stock, validandolo *antes* de enviarlo al server.
  2. El dropdown de Bodega Destino no debe mostrar la bodega que ya se selecciono en Origen.
* **Interaccion**: Enviar en un solo payload todo el carrito (batch). Mostrar Spinner.

### Criterios de Aceptacion (Checklist)
- [ ] Componente visual de transferencia tipo carrito creado.
- [ ] Logica implementada para consultar y mostrar la disponibilidad real pre-transferencia en memoria.
- [ ] Logica implementada para evitar seleccionar la misma bodega como origen y destino.
- [ ] Manejo de banderas de error y advertencias de stock minimo devueltas por la API.
EOF
)
gh issue create --title "$TITLE_12" --body "$BODY_12" --label "frontend" --label "enhancement" "${PROJECT_FLAG[@]}"

echo "Todos los tickets han sido creados con descripciones tecnicas detalladas!"
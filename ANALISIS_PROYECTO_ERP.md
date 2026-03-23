# Análisis Completo del Proyecto ERP

## 1. Estructura del Módulo de Órdenes (orders/)

### Tree Estructura
```
orders/
├── payment_method/          # Gestión de métodos de pago
│   ├── __init__.py
│   ├── exceptions.py
│   ├── urls.py
│   ├── apis/
│   ├── models/
│   ├── repositories/
│   ├── serializers/
│   └── services/
├── order_status/            # Estados de órdenes
│   ├── urls.py
│   ├── apis/
│   ├── models/
│   └── serializers/
├── order/                   # Gestión principal de órdenes
│   ├── __init__.py
│   ├── urls.py
│   ├── exceptions.py
│   ├── apis/                # Endpoints REST
│   ├── models/
│   ├── repositories/
│   ├── serializers/
│   └── services/
├── order_item/              # Items dentro de órdenes (relación M2M con productos)
│   ├── __init__.py
│   ├── urls.py
│   ├── exceptions.py
│   ├── apis/
│   ├── models/
│   ├── repositories/
│   ├── serializers/
│   └── services/
├── order_item_history/      # Historial de cambios en items
├── order_history/           # Historial de cambios en órdenes
├── receipt/                 # Recibos
└── receipt_adjustment/      # Ajustes en recibos
```

### Endpoints REST Disponibles

#### Order (Órdenes Principales)
- **GET** `/api/orders/` - Listar todas las órdenes
  - Retorna: Lista de órdenes con relacionados (cliente, estado, método de pago)
  - Ruta: [orders/order/urls.py](orders/order/urls.py)

- **POST** `/api/orders/` - Crear nueva orden
  - Requiere: `customer_id`, `short_id` (opcional), `status_id` (opcional), `payment_method_id` (opcional), `shipping_address`, `shipping_cost`, `notes`
  - Retorna: Orden creada con ID asignado
  - Archivo: [orders/order/apis/views.py](orders/order/apis/views.py#L13-L47)

- **GET** `/api/orders/catalogs/` - Obtener catálogos de clientes y métodos de pago
  - Requiere: `IsAuthenticated`
  - Retorna: Objetos `customers` y `payment_methods` para un dropdown
  - Archivo: [orders/order/apis/views.py](orders/order/apis/views.py#L49-L58)

#### Order Status (Estados)
- **GET** `/api/statuses/` - Listar estados de órdenes
- **POST** `/api/statuses/` - Crear nuevo estado
- **GET** `/api/statuses/{id}/` - Detalle de estado
- **PATCH** `/api/statuses/{id}/` - Actualizar estado
- Ruta: [orders/order_status/urls.py](orders/order_status/urls.py)

#### Payment Methods (Métodos de Pago)
- **GET** `/api/payment-methods/` - Listar métodos
- **POST** `/api/payment-methods/` - Crear método
- **GET** `/api/payment-methods/{id}/` - Detalle
- **PATCH** `/api/payment-methods/{id}/` - Actualizar
- Ruta: [orders/payment_method/urls.py](orders/payment_method/urls.py)

### Servicios/Functions en Órdenes

**Archivo:** [orders/order/services/services.py](orders/order/services/services.py)

```python
# Funciones disponibles:

def get_orders():
    """
    Obtiene todas las órdenes ordenadas por fecha descendente
    Retorna: QuerySet de all orders
    """
    return Order.objects.all().order_by('-created_at')

def create_order(customer_id, status_id=None, payment_method_id=None, 
                 short_id=None, shipping_address=None, shipping_cost=0.00, notes=None):
    """
    Crea una nueva orden con validaciones:
    - Genera short_id único si no se proporciona (formato: ORD-XXXXX)
    - Asigna estado default SOLICITADO o BORRADOR si no existe status_id
    - Es transacción atómica para evitar inconsistencias
    Retorna: Order instance
    """
    ...

def generate_short_id():
    """Genera ID único: ORD-ABC12"""
    ...
```

---

## 2. Archivos de Productos (ORMs: Product y ProductVariant)

### Ubicación de Archivos

#### Product Model
**Ruta:** [products/product/models/models.py](products/product/models/models.py)

```python
class Product(models.Model):
    entrepreneur = models.ForeignKey(Entrepreneur, on_delete=models.RESTRICT)
    business_unit = models.ForeignKey(BusinessUnit, on_delete=models.RESTRICT)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
```

**Campos:**
- `entrepreneur`: Quién vende el producto (tabla `entrepreneurs`)
- `business_unit`: Unidad de negocio (Distribuidora o Tienda)
- `category`: Categoría jerárquica (puede ser NULL)
- `name`: Nombre del producto (255 chars)
- `description`: Descripción opcional
- `created_at` / `updated_at`: Timestamps

#### ProductVariant Model
**Ruta:** [products/variant/models/models.py](products/variant/models/models.py)

```python
class ProductVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    sku = models.CharField(max_length=100, unique=True)
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    uom = models.ForeignKey(UoM, on_delete=models.RESTRICT)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity_available = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_variants'
```

**Campos:**
- `product`: Referencia al producto (CASCADE: si se borra el producto, se borran las variantes)
- `sku`: Código único (Stock Keeping Unit)
- `size`: Talla (NULL para perecederos)
- `color`: Color (NULL para perecederos)
- `uom`: Unidad de Medida (Restringida: no se puede borrar si está en uso)
- `cost`: Costo unitario
- `price`: Precio unitario
- `quantity_available`: Stock actual consolidado
- `is_active`: Indica si la variante está disponible para venta

### Estructura de Subdirectorios

```
products/
├── product/
│   ├── models/
│   │   └── models.py          # Product ORM
│   ├── apis/
│   ├── repositories/
│   ├── serializers/
│   └── services/
├── variant/
│   ├── models/
│   │   └── models.py          # ProductVariant ORM
│   ├── apis/
│   ├── repositories/
│   ├── serializers/
│   └── services/
├── category/
│   ├── models/
│   │   └── models.py          # Category jerárquica
│   └── ...
├── size/                        # Catálogo de tallas
│   └── models.py
└── color/                       # Catálogo de colores
    └── models.py
```

---

## 3. Inyección de Dependencias: Patrón Implementado

### Concepto General

El proyecto implementa **Inyección de Dependencias Manual** usando un **Service Locator Pattern** con contenedores (`container.py`).

### Patrón en Users

**Archivo:** [users/container.py](users/container.py)

```python
from users.role.repositories.repositories import RoleRepository
from users.role.services.services import RoleService
from users.user.repositories.repositories import UserRepository
from users.user.services.services import UserService

class UserContainer:
    def __init__(self):
        self.role_repository = RoleRepository()
        self.role_service = RoleService(repository=self.role_repository)
        
        self.user_repository = UserRepository()
        self.user_service = UserService(
            repository=self.user_repository,
            role_service=self.role_service  # ◄--- Inyección de servicio en otro
        )

# Global container instance
user_container = UserContainer()
```

**Estructura Repository → Service:**

- **Repository** (Acceso a datos):
  ```python
  # [users/user/repositories/repositories.py]
  class UserRepository:
      def get_by_id(self, user_id: int) -> Optional[User]:
          try:
              return User.objects.get(id=user_id)
          except ObjectDoesNotExist:
              return None
      
      def create(self, name: str, role: Role, email: str = None, ...) -> User:
          return User.objects.create(...)
      
      def get_by_email(self, email: str) -> Optional[User]:
          try:
              return User.objects.get(email=email)
          except ObjectDoesNotExist:
              return None
  ```

- **Service** (Lógica de negocio):
  ```python
  # [users/user/services/services.py]
  class UserService:
      def __init__(self, repository: UserRepository = None, role_service: RoleService = None):
          self.repository = repository or UserRepository()
          self.role_service = role_service or RoleService()
      
      def create_user(self, name: str, role_id: int, email: str = None, password: str = None) -> User:
          if email and self.get_user_by_email(email):
              raise ValueError(f"Ya existe un usuario con el correo {email}.")
          
          role = self.role_service.get_role(role_id)  # ◄--- Usa otro servicio
          if not role:
              raise ValueError(f"El rol con id {role_id} no existe.")
          
          password_hash = make_password(password) if password else None
          return self.repository.create(name=name, role=role, email=email, password_hash=password_hash)
  ```

### Patrón en Inventory

**Archivo:** [inventory/container.py](inventory/container.py)

```python
from inventory.uom.repositories.repositories import UomRepository
from inventory.uom.services.services import UomService
from inventory.uom_conversion.repositories.repositories import UomConversionRepository
from inventory.uom_conversion.services.services import UomConversionService

class InventoryContainer:
    def __init__(self):
        self.uom_repository = UomRepository()
        self.uom_service = UomService(repository=self.uom_repository)
        
        self.uom_conversion_repository = UomConversionRepository()
        self.uom_conversion_service = UomConversionService(
            repository=self.uom_conversion_repository
        )

# Global container instance
inventory_container = InventoryContainer()
```

### Patrón en Repository (Ejemplo UOM)

**Archivo:** [inventory/uom/repositories/repositories.py](inventory/uom/repositories/repositories.py)

```python
class UomRepository:
    def get_all(self) -> QuerySet['UoM']:
        return UoM.objects.all().order_by('code')
    
    def get_by_id(self, uom_id: int) -> Optional[UoM]:
        try:
            return UoM.objects.get(id=uom_id)
        except ObjectDoesNotExist:
            return None
    
    def get_by_code(self, code: str) -> Optional[UoM]:
        try:
            return UoM.objects.get(code=code)
        except ObjectDoesNotExist:
            return None
    
    def create(self, code: str, name: str) -> UoM:
        return UoM.objects.create(code=code, name=name)
    
    def update(self, uom: UoM, **kwargs) -> UoM:
        for key, value in kwargs.items():
            setattr(uom, key, value)
        uom.save()
        return uom
    
    def delete(self, uom: UoM) -> None:
        uom.delete()
    
    def has_conversions(self, uom_id: int) -> bool:
        return (
            UoMConversion.objects.filter(from_uom_id=uom_id).exists()
            or UoMConversion.objects.filter(to_uom_id=uom_id).exists()
        )
```

### Patrón en Service (Ejemplo UOM)

**Archivo:** [inventory/uom/services/services.py](inventory/uom/services/services.py)

```python
class UomService:
    def __init__(self, repository: UomRepository = None):
        self.repository = repository or UomRepository()
    
    def list_uoms(self) -> QuerySet['UoM']:
        return self.repository.get_all()
    
    def get_uom(self, uom_id: int) -> Optional[UoM]:
        return self.repository.get_by_id(uom_id)
    
    def create_uom(self, code: str, name: str) -> UoM:
        code = code.strip().lower()
        if self.repository.get_by_code(code):
            raise ValueError(f"Ya existe una UOM con el código '{code}'.")
        return self.repository.create(code=code, name=name)
    
    def update_uom(self, uom_id: int, **kwargs) -> UoM:
        uom = self.repository.get_by_id(uom_id)
        if not uom:
            raise ValueError(f"UOM con id {uom_id} no encontrada.")
        if 'code' in kwargs:
            kwargs['code'] = kwargs['code'].strip().lower()
            existing = self.repository.get_by_code(kwargs['code'])
            if existing and existing.id != int(uom_id):
                raise ValueError(f"Ya existe una UOM con el código '{kwargs['code']}'.")
        return self.repository.update(uom, **kwargs)
```

### Cómo se Usa en Views/APIs

**Archivos:** [orders/order/apis/views.py](orders/order/apis/views.py)

```python
from rest_framework.views import APIView
from orders.order.services.services import create_order, get_orders
from orders.order.serializers.serializers import OrderCreateSerializer

class OrderAPIView(APIView):
    def get(self, request):
        try:
            orders = get_orders()  # ◄--- Llamar función service
            serializer = OrderSerializer(orders, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def post(self, request):
        serializer = OrderCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {"message": "Invalid data", "errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            validated_data = serializer.validated_data
            order = create_order(  # ◄--- Inyecta parámetros, no depende del container
                customer_id=validated_data['customer_id'],
                status_id=validated_data.get('status_id'),
                payment_method_id=validated_data.get('payment_method_id'),
                short_id=validated_data.get('short_id'),
                ...
            )
            response_serializer = OrderSerializer(order)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
```

---

## 4. Archivos containers.py: Patrones Detallados

### Container en Users

**Ruta:** [users/container.py](users/container.py)

```python
# ┌─────────────────────────────────────────────────────────────┐
# │  INITIALIZATION SEQUENCE                                    │
# ├─────────────────────────────────────────────────────────────┤
# │ 1. Crear RoleRepository (no tiene dependencias)     ▼       │
# │    ↓                                                         │
# │ 2. Crear RoleService (recibe RoleRepository)        ▼       │
# │    ↓                                                         │
# │ 3. Crear UserRepository (no tiene dependencias)     ▼       │
# │    ↓                                                         │
# │ 4. Crear UserService (recibe ambos repositorio y servicio)  │
# │    ✓ Inyección de dependencias completa              ▼      │
# │                                                              │
# │ user_container = UserContainer()  (Singleton global)        │
# └─────────────────────────────────────────────────────────────┘
```

**Ventajas de este patrón:**
- Centraliza la creación de dependencias
- Evita crear nuevas instancias en cada llamada
- Permite fácil testing con mocks
- Claridad en cascada de dependencias

### Container en Inventory

**Ruta:** [inventory/container.py](inventory/container.py)

```python
# Similar a Users, pero con servicios de inventario:
# - UomRepository → UomService
# - UomConversionRepository → UomConversionService
```

---

## 5. Campos/Propiedades que Necesita Orders de Products

### Relación: Order Items ↔ Product Variants

**Diagrama Base de Datos:**
```
┌──────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│     orders       │◄────────│   order_items    │────────►│  product_variants │
├──────────────────┤         ├──────────────────┤         ├─────────────────┤
│ id (PK)          │         │ id (PK)          │         │ id (PK)          │
│ short_id         │         │ order_id (FK)    │         │ product_id (FK)  │
│ customer_id (FK) │         │ variant_id (FK) ──────────►│ sku              │
│ status_id (FK)   │         │ quantity         │         │ size_id          │
│ payment_method   │         │ unit_cost        │         │ color_id         │
│ shipping_cost    │         │ unit_price       │         │ uom_id (FK)      │
│ ...              │         │ status_id (FK)   │         │ cost             │
└──────────────────┘         │ created_at       │         │ price            │
                             └──────────────────┘         │ quantity_available
                             ◄─────────────────────────────│ is_active
                                                           │ ...
                                                           └─────────────────┘
```

### Fields Requeridos en ProductVariant para OrderItem

**Archivo:** [products/variant/models/models.py](products/variant/models/models.py)

```python
class ProductVariant(models.Model):
    # ✓ REQUERIDO para OrderItem:
    sku = models.CharField(max_digits=100, unique=True)
    # → Identificador único para el cliente/factura
    
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    # → Se copia a OrderItem.unit_cost en el momento de la compra
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    # → Se copia a OrderItem.unit_price en el momento de la compra
    
    quantity_available = models.IntegerField(default=0)
    # → Validación: La cantidad solicitada no puede exceder esto
    
    uom = models.ForeignKey(UoM, on_delete=models.RESTRICT)
    # → Información de unidad de medida (para mostrar cantidades)
    
    # ✓ CAMPOS QUE SE MUESTRAN EN ORDEN:
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    # → Información del producto (nombre, descripción)
    
    size = models.ForeignKey(Size, on_delete=models.SET_NULL, null=True, blank=True)
    color = models.ForeignKey(Color, on_delete=models.SET_NULL, null=True, blank=True)
    # → Detalles de la variante (color/talla)
    
    is_active = models.BooleanField(default=True)
    # → Validación: Solo variantes activas pueden añadirse a órdenes
```

### OrderItem Model

**Ruta:** [orders/order_item/models/models.py](orders/order_item/models/models.py)

```python
class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    # → Relación con la orden
    
    variant = models.ForeignKey(ProductVariant, on_delete=models.RESTRICT)
    # → Referencia al ProductVariant
    
    quantity = models.PositiveIntegerField()
    # → Cantidad solicitada (debe validarse contra variant.quantity_available)
    
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2)
    # → Costo capturado AL MOMENTO DE LA COMPRA (para auditoría)
    
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # → Precio capturado AL MOMENTO DE LA COMPRA (para auditoría)
    
    status = models.ForeignKey(OrderStatus, on_delete=models.RESTRICT)
    # → Estado individual del item
    
    created_at = models.DateTimeField(auto_now_add=True)
```

### Validaciones Necesarias en crear OrderItem

When creating an `OrderItem`:

1. **Existencia:**
   - ProductVariant debe existir
   - Debe estar `is_active=True`

2. **Inventario:**
   - `quantity ≤ variant.quantity_available`

3. **Precios:**
   - Capturar `variant.cost` → `unit_cost`
   - Capturar `variant.price` → `unit_price`
   - (Nunca actualizar estos después, son históricos)

4. **Unidades:**
   - Mostrar UoM (ej: "5 UnidadesKG" o "3 Unidades")

### Serializadores de Orden

**Ruta:** [orders/order/serializers/serializers.py](orders/order/serializers/serializers.py)

```python
class OrderCreateSerializer(serializers.Serializer):
    short_id = serializers.CharField(max_length=20, required=False, allow_blank=True)
    customer_id = serializers.PrimaryKeyRelatedField(
        queryset=Customer.objects.all(), required=True, write_only=True
    )
    payment_method_id = serializers.PrimaryKeyRelatedField(
        queryset=PaymentMethod.objects.all(), required=False, allow_null=True, write_only=True
    )
    status_id = serializers.PrimaryKeyRelatedField(
        queryset=OrderStatus.objects.all(), required=False, allow_null=True, write_only=True
    )
    shipping_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    shipping_cost = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=0.00)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
```

---

## 6. Resumen del Patrón de Dependencias

### Layer Stack

```
┌──────────────────────────────────────────────────────────────┐
│  APIView / Controller (REST Framework)                       │
│  ├─ Llama: Service functions / methods                       │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────────────┐
│  Service Layer (Lógica de Negocio)                           │
│  ├─ Inyecta: Repository                                      │
│  ├─ Inyecta: Otros Services                                  │
│  ├─ Valida datos                                             │
│  ├─ Aplica reglas de negocio                                 │
│  └─ Retorna: Domain Objects (Models)                         │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────────────┐
│  Repository Layer (Acceso a Datos)                           │
│  ├─ Abstrae: querysets de Django ORM                         │
│  ├─ CRUD operations                                          │
│  ├─ Manejo de Excepciones                                    │
│  └─ Retorna: Models / QuerySets                              │
└────────────────────┬─────────────────────────────────────────┘
                     │
┌────────────────────┴─────────────────────────────────────────┐
│  ORM Models (Django)                                         │
│  ├─ Mapeo a BD                                               │
│  └─ Definición de relaciones                                 │
└────────────────────────────────────────────────────────────────┘
```

### Flujo de una Solicitud POST /orders/

```
1. APIView.post() recibe request
      ↓
2. Valida con OrderCreateSerializer
      ↓
3. Llama services.create_order(validated_data)
      ↓
4. Service genera short_id único
      ↓
5. Service valida que exista el estado (default SOLICITADO)
      ↓
6. Service/Repository crea Order en BD (transacción atómica)
      ↓
7. Retorna Order para serializar
      ↓
8. APIView retorna Response HTTP 201 CREATED
```

---

## 7. Estructura de Archivos Críticos

```
backend/
├── inventory/
│   ├── container.py              ◄─── Contenedor DI
│   ├── uom/
│   │   ├── models/models.py
│   │   ├── repositories/repositories.py
│   │   └── services/services.py
│   └── uom_conversion/
│       ├── repositories/repositories.py
│       └── services/services.py
│
├── users/
│   ├── container.py              ◄─── Contenedor DI
│   ├── user/
│   │   ├── models/models.py
│   │   ├── repositories/repositories.py
│   │   └── services/services.py
│   └── role/
│       ├── models/models.py
│       ├── repositories/repositories.py
│       └── services/services.py
│
├── products/
│   ├── product/
│   │   └── models/models.py      ◄─── Product ORM
│   ├── variant/
│   │   └── models/models.py      ◄─── ProductVariant ORM
│   ├── category/
│   │   └── models/models.py
│   ├── size/models.py
│   └── color/models.py
│
└── orders/
    ├── order/
    │   ├── models/models.py      ◄─── Order ORM
    │   ├── repositories/repositories.py
    │   ├── services/services.py
    │   ├── serializers/serializers.py
    │   ├── apis/views.py         ◄─── REST Endpoints
    │   └── urls.py
    ├── order_item/
    │   ├── models/models.py      ◄─── OrderItem ORM
    │   ├── repositories/repositories.py
    │   └── ...
    ├── order_status/
    │   └── ...
    └── payment_method/
        └── ...
```

---

## 8. Conclusiones

### Patrón Utilizado: **Clean Architecture + Dependency Injection**

✓ **Ventajas:**
- Separación clara de responsabilidades
- Fácil de testear (inyectar mocks)
- Reutilizable en múltiples vistas
- Mantenible y escalable

✗ **Limitaciones:**
- No usa framework DI completo (Pydantic, FastAPI)
- Inyección manual en cada servicio constructor
- No hay singleton pattern forzado en contenedores

### Next Steps para Orders Module

Para completar el módulo de órdenes, se necesitaría:
1. Service layer para `OrderItem` crear/actualizar
2. Container para órdenes (si escalas con más servicios)
3. Validaciones de inventario en `OrderItemService`
4. Endpoints PUT/PATCH para actualizar estado de órdenes
5. Historial de cambios (`OrderStatusHistory`, `OrderItemStatusHistory`)

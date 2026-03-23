# Arquitectura de Inyección de Dependencias para Órdenes

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Problema a Resolver](#problema-a-resolver)
3. [Solución: Dependency Injection](#solución-dependency-injection)
4. [Componentes Principales](#componentes-principales)
5. [Cómo Funciona](#cómo-funciona)
6. [Patrones de Uso](#patrones-de-uso)
7. [Migración Futura](#migración-futura)
8. [Testing](#testing)

---

## Visión General

Este documento explica la arquitectura de inyección de dependencias implementada en el módulo de **órdenes** para acceder a datos de **productos** sin bloquear el desarrollo mientras el equipo de productos completa su servicio.

### La Idea Principal

```
┌─────────────────────────────────────────┐
│     API de Órdenes (OrderAPI)          │
└────────────────┬──────────────────────┘
                 │ usa
                 ▼
         ┌─────────────────┐
         │  Interfaz       │ (IProductService)
         │  ProductService │ - Contrato
         └────────┬────────┘
                  │ implementada por
       ┌──────────┴──────────┐
       ▼                     ▼
┌────────────────┐  ┌──────────────────────┐
│  ProductService│  │ ProductServiceMock   │
│  (FUTURO)      │  │ (TEMPORAL - AHORA)   │
│                │  │                      │
│ Accede a       │  │ Query directa al ORM │
│ repository     │  │ ProductVariant       │
└────────────────┘  └──────────────────────┘
```

**Ventaja:** Cuando el equipo de productos termine, solo cambiamos UNA línea en el container.

---

## Problema a Resolver

El módulo de órdenes depende de funcionalidades de productos que aún no están completas:

- ✗ ProductService no existe
- ✗ ProductRepository no existe
- ✓ ProductVariant ORM sí existe

**Sin esta solución:** Estaríamos bloqueados esperando al otro equipo.

**Con esta solución:** Accedemos directo al ORM, el módulo de órdenes se desarrolla con normalidad, y cuando llegue ProductService real, solo cambiamos la inyección.

---

## Solución: Dependency Injection

### ¿Qué es?

La **inyección de dependencias** es un patrón que permite que un objeto reciba sus dependencias (otros objetos que necesita) en lugar de crearlas él mismo.

### Tipos de Inyección

```python
# ❌ MAL: La clase crea sus propias dependencias
class OrderService:
    def __init__(self):
        self.product_service = ProductServiceMock()  # Acoplado
        
# ✅ BIEN: Las dependencias se inyectan
class OrderService:
    def __init__(self, product_service: IProductService = None):
        self.product_service = product_service or ProductServiceMock()  # Flexible
```

### Beneficios

| Beneficio | Explicación |
|-----------|-------------|
| **Testabilidad** | Podés pasar un mock en tests |
| **Flexibilidad** | Cambiar implementación sin tocar el código |
| **Desacoplamiento** | El servicio no conoce detalles de ProductService |
| **Mantenibilidad** | Cambios localizados en un solo lugar |

---

## Componentes Principales

### 1. **IProductService** (Interfaz)

📁 `orders/products/interfaces.py`

Define el **contrato** que cualquier implementación de ProductService debe cumplir.

```python
class IProductService(ABC):
    @abstractmethod
    def get_variant_by_id(self, variant_id: int) -> Optional[Dict[str, Any]]:
        """Obtener un variante por ID"""
        pass
    
    @abstractmethod
    def validate_variant_availability(self, variant_id: int, quantity: int, 
                                     business_unit_id: int) -> tuple[bool, Optional[str]]:
        """Validar disponibilidad de un variante"""
        pass
```

**¿Por qué una interfaz (ABC)?**

- Define qué métodos **DEBE** tener cualquier ProductService
- Si alguien intenta usar ProductService sin implementar estos métodos, Python lanzará error
- Actúa como "contrato" entre equipos

### 2. **ProductServiceMock** (Implementación Temporal)

📁 `orders/products/services.py`

Implementa `IProductService` y **accede directo al ORM**.

```python
class ProductServiceMock(IProductService):
    def get_variant_by_id(self, variant_id: int):
        """Query directo a ProductVariant ORM"""
        try:
            variant = ProductVariant.objects.select_related(
                'product',
                'product__business_unit'
            ).get(id=variant_id)
            return self._variant_to_dict(variant)
        except ProductVariant.DoesNotExist:
            return None
```

**¿Por qué "Mock"?**

- Es una implementación **temporal** (mock = imitación)
- Cubre la funcionalidad necesaria ahora
- Será reemplazada cuando ProductService real esté lista

**Métodos Proporcionados:**

```python
get_variant_by_id(variant_id)              # Obtener por ID
get_variant_by_sku(sku)                    # Obtener por SKU
validate_variant_availability(...)         # Validar disponibilidad
get_variants_by_business_unit(bu_id)       # Listar por unidad de negocio
calculate_line_total(variant_id, qty)      # Calcular total de la línea
```

### 3. **OrdersContainer** (Contenedor)

📁 `orders/container.py`

Es el **punto central** donde se instancian todas las dependencias del módulo.

```python
class OrdersContainer:
    def __init__(self):
        self.product_service: IProductService = ProductServiceMock()

orders_container = OrdersContainer()  # Singleton global
```

**¿Por qué un contenedor?**

- ✅ Una sola instancia de `product_service` (no se crea múltiples veces)
- ✅ Cambio centralizado: si necesitamos otra implementación, solo editamos aquí
- ✅ Seguimos el patrón de otros módulos (users, inventory)

---

## Cómo Funciona

### Flujo Completo: Crear una Orden

```
1. Cliente hace POST /api/orders/
   ↓
2. OrderCreateAPI recibe el request
   ├─→ from orders.container import orders_container
   ├─→ product_service = orders_container.product_service
   ├─→ variant = product_service.get_variant_by_id(123)
   ├─→ is_valid, error = product_service.validate_variant_availability(123, qty, bu_id)
   │
3. Si válido, crea OrderItem con:
   ├─→ unit_price = variant['price']  (capturado en este momento)
   ├─→ unit_cost = variant['cost']    (capturado en este momento)
   │
4. Guarda en BD
   ↓
5. Retorna respuesta
```

### Ejemplo en una API

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from orders.container import orders_container

class OrderCreateAPI(APIView):
    def post(self, request):
        variant_id = request.data['variant_id']
        quantity = request.data['quantity']
        business_unit_id = request.data['business_unit_id']
        
        # Obtener producto usando inyección
        variant = orders_container.product_service.get_variant_by_id(variant_id)
        if not variant:
            return Response({'error': 'Variant not found'}, status=400)
        
        # Validar disponibilidad
        is_valid, error = orders_container.product_service.validate_variant_availability(
            variant_id, quantity, business_unit_id
        )
        if not is_valid:
            return Response({'error': error}, status=400)
        
        # Crear orden...
        print(f"Variante: {variant['sku']}, Precio: {variant['price']}")
```

---

## Patrones de Uso

### ✅ Patrón Correcto

```python
# En cualquier archivo que necesite producto_service:
from orders.container import orders_container

# Usar el servicio
variant = orders_container.product_service.get_variant_by_id(123)
```

### ❌ Patrones Incorrectos

```python
# ❌ NO HAGAS ESTO - Importar directo el servicio
from orders.products.services import ProductServiceMock
service = ProductServiceMock()  # Instancia nueva cada vez

# ❌ NO HAGAS ESTO - Importar el ORM directo
from products.variant.models import ProductVariant
v = ProductVariant.objects.get(id=123)  # Pierde la interfaz y validaciones
```

---

## Migración Futura

### Cuando el Equipo de Productos esté Listo

El equipo de productos entregará algo como:

```python
# products/services.py (FUTURO)
class ProductService(IProductService):
    def __init__(self, repository: ProductRepository = None):
        self.repository = repository or ProductRepository()
    
    def get_variant_by_id(self, variant_id):
        return self.repository.get_variant(variant_id)
```

### Paso 1: Copiar/Importar su servicio

```python
# orders/container.py (CAMBIO MÍNIMO)
- from orders.products.services import ProductServiceMock
+ from products.services import ProductService
+ from products.repositories import ProductRepository
```

### Paso 2: Cambiar instanciación

```python
class OrdersContainer:
    def __init__(self):
        # Antes:
        # self.product_service = ProductServiceMock()
        
        # Después:
        product_repository = ProductRepository()
        self.product_service = ProductService(repository=product_repository)
```

**Resultado:** 
- ✅ Cero cambios en las APIs de órdenes
- ✅ Cero cambios en la lógica de negocio
- ✅ Solo 3 líneas cambiadas en el contenedor

---

## Testing

### Test con Mock (Ahora)

```python
from django.test import TestCase
from orders.products.services import ProductServiceMock
from orders.container import orders_container

class TestOrderCreation(TestCase):
    def test_order_with_valid_variant(self):
        """Test que la orden se crea cuando el variante es válido"""
        
        # Usar el producto service del contenedor
        variant = orders_container.product_service.get_variant_by_id(1)
        self.assertIsNotNone(variant)
        self.assertEqual(variant['sku'], 'SKU-001')
```

### Test con Mock Custom (Para Testing Aislado)

```python
class MockProductService(IProductService):
    """Mock custom para tests - reemplaza fixture en BD"""
    
    def get_variant_by_id(self, variant_id):
        return {
            'id': variant_id,
            'sku': 'TEST-SKU',
            'price': 100.00,
            'cost': 50.00,
            'quantity_available': 1000,
            'is_active': True
        }

# En el test:
class TestOrderService(TestCase):
    def setUp(self):
        # Inyectar mock personalizado
        self.original_service = orders_container.product_service
        orders_container.product_service = MockProductService()
    
    def tearDown(self):
        orders_container.product_service = self.original_service
```

---

## Estructura de Archivos

```
orders/
├── __init__.py
├── container.py                    ⭐ Punto central (AQUÍ cambiar implementación)
├── models.py
├── urls.py
├── views.py
├── products/                       ⭐ Nueva carpeta
│   ├── __init__.py
│   ├── interfaces.py              ⭐ Define IProductService
│   └── services.py                ⭐ ProductServiceMock (temporal)
├── order/
│   ├── models/
│   ├── services/
│   ├── apis/
│   └── ...
├── order_item/
│   ├── models/
│   ├── services/
│   ├── apis/
│   └── ...
└── ...
```

---

## Resumen: ¿Por Qué Esto Funciona?

| Problema | Solución | Beneficio |
|----------|----------|----------|
| Equipo de productos aún no termina | Accedemos directo al ORM con mock temporal | No bloqueamos desarrollo |
| Queremos evitar cambios masivos después | Inyección de dependencias | Cambio centralizado en `container.py` |
| Necesitamos validaciones y lógica | Interfaz `IProductService` | Contrato claro, fácil de testear |
| Múltiples instancias del mismo servicio | Contenedor singleton | Una sola instancia, eficiente |
| Testing necesita mocks sin BD real | Mock custom en interfaz | Tests rápidos sin dependencias reales |

---

## ¿Preguntas Frecuentes?

### P: ¿Qué pasa si llamo `ProductServiceMock` directamente?

R: Funciona, pero pierde las ventajas. Siempre accede vía `orders_container` para poder cambiar la implementación sin tocar el código.

### P: ¿Puedo usar ProductVariant ORM directo en mis APIs?

R: Técnicamente sí, pero NO DEBERÍAS. Pierde el punto de la abstracción. Siempre usa `orders_container.product_service`.

### P: ¿Qué pasa cuando el equipo de productos entrega su servicio?

R: Reemplazas 3 líneas en `container.py`. Listo. Nada más necesita cambios.

### P: ¿Puedo agregar más métodos a la interfaz?

R: Sí. Agrégalos a `IProductService` en `interfaces.py`, luego implementa en `ProductServiceMock`.

### P: ¿Por qué ABC (Abstract Base Class)?

R: Para garantizar que cualquier implementación de `IProductService` tenga todos los métodos. Si falta uno, Python lanzará error.

---

## Links Útiles

- [Refactoring Guru - Dependency Injection](https://refactoring.guru/design-patterns/dependency-injection)
- [Python ABC Documentation](https://docs.python.org/3/library/abc.html)
- [Django Testing with Mocks](https://docs.djangoproject.com/en/stable/topics/testing/)


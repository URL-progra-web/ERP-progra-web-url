# Seeders - Datos por defecto

Este documento describe los seeders disponibles en el proyecto y cómo utilizarlos.

## Seeders Disponibles

Los siguientes seeders están configurados para poblar la base de datos con datos por defecto:

### 1. **UserSeeder** (`users.seeds.UserSeeder`)
- Crea roles por defecto: ADMIN, MANAGER, VISITOR
- Crea un usuario administrador: admin@admin.com (password: admin)

### 2. **UomSeeder** (`inventory.uom.seeds.UomSeeder`)
- Crea unidades de medida básicas:
  - Unidad (und)
  - Kilogramo (kg)
  - Gramo (g)
  - Litro (lt)
  - Mililitro (ml)
- Crea conversiones entre unidades (kg↔g, lt↔ml)

### 3. **ColorSeeder** (`products.color.seeds.ColorSeeder`)
- Crea 15 colores estándar con sus códigos hexadecimales:
  - Rojo, Azul, Verde, Amarillo, Negro, Blanco, Gris, Rosa, Naranja, Morado, Café, Beige, Azul Marino, Verde Oliva, Turquesa

### 4. **SizeSeeder** (`products.size.seeds.SizeSeeder`)
- Crea tallas de ropa: XXS, XS, S, M, L, XL, XXL, 3XL, 4XL
- Crea tallas numéricas para calzado: 35-44
- Crea tallas genéricas: Unitalla, Chico, Mediano, Grande

### 5. **CategorySeeder** (`products.category.seeds.CategorySeeder`)
- Crea categorías principales y subcategorías:
  - **Ropa**: Camisetas, Pantalones, Vestidos, Chaquetas, Sudaderas, Shorts
  - **Calzado**: Zapatillas, Botas, Sandalias, Zapatos formales, Deportivo
  - **Accesorios**: Bolsos, Gorras, Cinturones, Joyería, Gafas
  - **Electrónica**: Smartphones, Laptops, Tablets, Audífonos, Cámaras
  - **Hogar**: Muebles, Decoración, Cocina, Textiles
  - **Deportes**: Equipamiento, Ropa deportiva, Suplementos

### 6. **BusinessUnitSeeder** (`inventory.business_unit.seeds.BusinessUnitSeeder`)
- Crea unidades de negocio:
  - Tienda Principal
  - Tienda Norte
  - Tienda Sur
  - Almacén Central
  - Tienda Online
  - Outlet

### 7. **EntrepreneurSeeder** (`crm.entrepreneur.seeds.EntrepreneurSeeder`)
- Crea 5 emprendedores de ejemplo con datos de contacto:
  - Fashion House S.A.
  - Tech Solutions Peru
  - Sport Center
  - Home & Deco
  - Calzado Premium

### 8. **CustomerSeeder** (`crm.customer.seeds.CustomerSeeder`)
- Crea 20 clientes de ejemplo:
  - **10 clientes minoristas (RETAIL)**: Personas individuales con nombres, teléfonos, emails y direcciones
  - **10 clientes mayoristas (WHOLESALE)**: Empresas comerciales con datos de contacto completos
- Los clientes incluyen información completa: nombre, teléfono único, email único, dirección y tipo de cliente

### 9. **ProductSeeder** (`products.product.seeds.ProductSeeder`)
- Crea 12 productos de ejemplo en diferentes categorías:
  - Ropa: Camisetas y pantalones
  - Calzado: Zapatillas
  - Electrónica: Smartphones y laptops
  - Accesorios: Bolsos y mochilas

### 10. **ProductVariantSeeder** (`products.variant.seeds.ProductVariantSeeder`)
- Crea variantes de productos con diferentes combinaciones de:
  - Tallas (S, M, L, XL, 40, 41, 42)
  - Colores (Negro, Blanco, Azul, Rojo, Gris)
  - SKUs únicos
  - Precios de costo y venta
  - Cantidades disponibles

## Cómo Ejecutar los Seeders

### Ejecutar todos los seeders

Para ejecutar todos los seeders en el orden correcto:

```bash
cd backend
python manage.py seed
```

Este comando ejecutará todos los seeders en el orden especificado, respetando las dependencias entre ellos.

### Ejecutar un seeder específico

Para ejecutar solo un seeder específico:

```bash
python manage.py seed --seeder <ruta.del.seeder>
```

Ejemplos:

```bash
# Solo colores
python manage.py seed --seeder products.color.seeds.ColorSeeder

# Solo categorías
python manage.py seed --seeder products.category.seeds.CategorySeeder

# Solo productos
python manage.py seed --seeder products.product.seeds.ProductSeeder
```

## Orden de Ejecución Recomendado

Los seeders deben ejecutarse en el siguiente orden para respetar las dependencias:

1. UserSeeder (roles y usuarios)
2. UomSeeder (unidades de medida)
3. ColorSeeder (colores)
4. SizeSeeder (tallas)
5. CategorySeeder (categorías)
6. BusinessUnitSeeder (unidades de negocio)
7. EntrepreneurSeeder (emprendedores)
8. CustomerSeeder (clientes)
9. ProductSeeder (productos - requiere categorías, business units y emprendedores)
10. ProductVariantSeeder (variantes - requiere productos, colores, tallas y UoM)

**Nota:** El comando `python manage.py seed` ya ejecuta los seeders en este orden automáticamente.

## Notas Importantes

- **Los seeders son inteligentes y auto-detectan si ya fueron ejecutados**: Cada seeder verifica si sus datos ya existen en la base de datos antes de ejecutarse. Si detecta que ya fue ejecutado, se salta automáticamente sin generar errores.
- Los seeders están diseñados para ser idempotentes, es decir, pueden ejecutarse múltiples veces de forma segura.
- Al ejecutar `python manage.py seed` múltiples veces, solo se ejecutarán los seeders que aún no hayan sido corridos.
- Los seeders que ya detectan su propio estado (UserSeeder, UomSeeder) muestran mensajes informativos cuando encuentran datos existentes.
- Los seeders utilizan `print()` para mostrar el progreso en la consola.
- Las dependencias entre seeders (como entrepreneur y business_unit para products) son verificadas antes de crear registros.

### Ejemplo de Comportamiento

Primera ejecución:
```bash
$ python manage.py seed
Running seeder: products.color.seeds.ColorSeeder
Created color: Rojo
Created color: Azul
...
```

Segunda ejecución (sin errores):
```bash
$ python manage.py seed
Running seeder: products.color.seeds.ColorSeeder
Colors already seeded. Skipping...
Finished products.color.seeds.ColorSeeder
```

## Personalización

Para agregar más datos o modificar los existentes, edita los archivos de seeds correspondientes ubicados en:

- `backend/products/color/seeds.py`
- `backend/products/size/seeds.py`
- `backend/products/category/seeds.py`
- `backend/products/product/seeds.py`
- `backend/products/variant/seeds.py`
- `backend/inventory/business_unit/seeds.py`
- `backend/crm/entrepreneur/seeds.py`
- `backend/crm/customer/seeds.py`
- `backend/inventory/uom/seeds.py`
- `backend/users/seeds.py`

## Limpiar la Base de Datos

Si necesitas limpiar la base de datos antes de ejecutar los seeders:

```bash
# Eliminar y recrear la base de datos
python manage.py flush

# Ejecutar las migraciones
python manage.py migrate

# Ejecutar los seeders
python manage.py seed
```

#!/bin/bash

# ==============================================================================
# SCRIPT DE CREACIÓN DE TICKETS PARA GITHUB PROJECTS (INVENTARIO Y USUARIOS)
# ==============================================================================

echo "Creando etiquetas (labels) base..."
gh label create "frontend" --color "5319E7" --description "Tareas de interfaz con React/Vite" --force
gh label create "backend" --color "0052CC" --description "Tareas de API con Django" --force
gh label create "inventario" --color "008672" --description "Módulo de Inventario" --force
gh label create "usuarios" --color "D93F0B" --description "Módulo de Usuarios y RRHH" --force
gh label create "bug" --color "d73a4a" --description "Errores funcionales o técnicos" --force
gh label create "enhancement" --color "a2eeef" --description "Mejoras y utilidades" --force

echo "Generando los 15 tickets detallados..."

# =========================================================
# MÓDULO: INVENTARIO (7 Tickets)
# =========================================================

# FASE 1: FRONTEND (Inventario)
gh issue create \
  --title "[Inventario] UI: Listado de Productos y Filtros" \
  --label "frontend,inventario" \
  --milestone "Fase 1: Frontend" \
  --body "### Descripción
Implementar la vista principal del módulo de inventario que permita visualizar los productos.

### Criterios de Aceptación
- [ ] El módulo muestra un listado de productos simulados (mock data).
- [ ] Se incluye manejo de filtros (ej. por nombre o categoría).
- [ ] La interfaz es responsiva (enfoque mobile-first).
- [ ] La navegación es fluida como SPA (sin recargas de página).
- [ ] No existen errores críticos en la consola del navegador."

gh issue create \
  --title "[Inventario] UI: Formulario para Agregar Productos" \
  --label "frontend,inventario" \
  --milestone "Fase 1: Frontend" \
  --body "### Descripción
Crear el formulario para el registro de nuevos productos en el estado local de la aplicación.

### Criterios de Aceptación
- [ ] El formulario permite ingresar nombre, precio, stock y categoría.
- [ ] Se validan correctamente los campos obligatorios.
- [ ] El nuevo producto se refleja inmediatamente en el listado (estado local).
- [ ] El sistema muestra un mensaje visual de éxito o error al guardar.
- [ ] Mantiene coherencia visual con el resto de la aplicación."

gh issue create \
  --title "[Inventario] UI: Edición de Productos" \
  --label "frontend,inventario" \
  --milestone "Fase 1: Frontend" \
  --body "### Descripción
Habilitar la funcionalidad para modificar la información de un producto existente.

### Criterios de Aceptación
- [ ] El listado permite seleccionar un producto para editarlo.
- [ ] El formulario se precarga con los datos del producto seleccionado.
- [ ] Se validan los campos antes de actualizar.
- [ ] Los cambios se guardan correctamente en el estado local.
- [ ] Se muestra retroalimentación visual al usuario tras la edición."

# FASE 2: BACKEND (Inventario)
gh issue create \
  --title "[Inventario] API: Gestión y Registro de Productos" \
  --label "backend,inventario" \
  --milestone "Fase 2: Backend" \
  --body "### Descripción
Desarrollar los endpoints REST en Django para el CRUD de productos en la base de datos PostgreSQL.

### Criterios de Aceptación
- [ ] El sistema guarda correctamente los productos creados en la base de datos.
- [ ] Se evita la duplicidad de registros críticos (ej. código de producto o SKU).
- [ ] Las consultas devuelven la información correcta y completa del catálogo.
- [ ] La API devuelve mensajes claros y códigos de estado HTTP correctos ante errores.
- [ ] Los endpoints están protegidos y documentados."

gh issue create \
  --title "[Inventario] API: Registro de Movimientos de Inventario" \
  --label "backend,inventario" \
  --milestone "Fase 2: Backend" \
  --body "### Descripción
Implementar la lógica de negocio para controlar las entradas y salidas de stock.

### Criterios de Aceptación
- [ ] El sistema registra movimientos detallados de inventario (entradas y salidas).
- [ ] El stock del producto se actualiza automáticamente al registrar un movimiento.
- [ ] Se valida que no se puedan realizar salidas si el stock es insuficiente.
- [ ] La base de datos mantiene integridad transaccional y coherencia.
- [ ] Historial de movimientos disponible vía endpoint."

# FASE 3: IMPLEMENTACIÓN (Inventario)
gh issue create \
  --title "[Inventario] Integración: Frontend consume API de Inventario" \
  --label "frontend,backend,inventario" \
  --milestone "Fase 3: Implementacion" \
  --body "### Descripción
Conectar la interfaz de React con los endpoints de Django para que el módulo de inventario opere con datos reales.

### Criterios de Aceptación
- [ ] El frontend reemplaza los datos simulados por peticiones GET a la API.
- [ ] Las creaciones y ediciones envían peticiones POST/PUT/PATCH al backend.
- [ ] Se manejan adecuadamente los estados de carga (loading) y errores de red en la interfaz.
- [ ] Los módulos funcionan de forma integrada sin errores críticos."

gh issue create \
  --title
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

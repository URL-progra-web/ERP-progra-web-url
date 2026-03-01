# Backend (Django)

## Migraciones

Base de datos: PostgreSQL. Las tablas del módulo **inventory** viven en el schema `inventory` (p. ej. `inventory.inventory_category`, `inventory.inventory_product`).

### Crear migraciones (si cambias modelos)

```bash
cd backend
python manage.py makemigrations users
python manage.py makemigrations inventory
```

### Aplicar migraciones

```bash
cd backend
python manage.py migrate
```

Orden recomendado la primera vez:

1. `python manage.py migrate` — aplica todas (admin, auth, contenttypes, sessions, **users**, **inventory**).
2. La migración `inventory.0000_create_inventory_schema` crea el schema `inventory`; las siguientes crean las tablas dentro de ese schema.

### Con Docker

Si el backend corre en contenedor:

```bash
docker compose exec backend python manage.py migrate
```

O desde el directorio del proyecto:

```bash
docker compose run --rm backend python manage.py migrate
```

# Guía de Inicio del Proyecto ERP Micro

¡Bienvenido al equipo! Este documento contiene el paso a paso para configurar tu entorno de desarrollo local y echar a andar el proyecto por primera vez. Todo el proyecto está dockerizado, por lo que no necesitas instalar lenguajes ni bases de datos directamente en tu máquina.

## Requisitos Previos

Asegúrate de tener instalados los siguientes programas en tu sistema:
- [Git](https://git-scm.com/)
- [Docker](https://docs.docker.com/get-docker/) y Docker Compose

## 1. Descargar el código e Iniciar los contenedores

Primero, abre tu terminal en la carpeta principal del proyecto (donde se encuentra el archivo `docker-compose.yml`) y levanta los servicios usando Docker Compose:

```bash
docker compose up --build -d
```
> *Nota: El flag `-d` inicia los contenedores en segundo plano (detached mode). Toma un café mientras se descargan las imágenes de Postgres, Python y Node, y se instalan las dependencias.*

Para asegurarte de que todo está corriendo correctamente, verifica el estado de los contenedores con:
```bash
docker compose ps
```
Deberías ver arriba (Status: Up) tres contenedores: `erp_db`, `erp_backend` y `erp_frontend`.

## 2. Aplicar las migraciones de Base de Datos

Una vez que los contenedores están corriendo, tu base de datos de PostgreSQL estará totalmente vacía. Necesitamos decirle a Django que cree las tablas ejecutando las migraciones:

```bash
docker compose exec backend python manage.py migrate
```

## 3. Crear tu Usuario Administrador (Superuser)

Para poder entrar al sistema y tener todos los permisos, debes crear una cuenta principal. Ejecuta el siguiente comando y sigue las instrucciones que aparecerán en la terminal (te pedirá un correo, nombre de usuario y contraseña):

```bash
docker compose exec backend python manage.py createsuperuser
```
> *Nota: Al escribir la contraseña, la terminal no mostrará los caracteres por seguridad. Solo escríbela y presiona Enter.*

## 4. ¡Acceder al sistema!

Con la base de datos lista y tu usuario creado, puedes acceder al ERP desde tu navegador favorito:

- **Frontend (Aplicación React):** [http://localhost:5173](http://localhost:5173)
- **Backend (API DRF Interactiva):** [http://localhost:8000/api/](http://localhost:8000/api/)

Dirígete al Frontend e ingresa con el correo y la contraseña del superusuario que acabas de crear. ¡Y listo! Ya estás dentro.

---

## 🛠️ Comandos Útiles del Día a Día

Aquí tienes un breve "cheatsheet" para tu trabajo diario:

**Ver los logs del backend** (si hay algún error en el terminal):
```bash
docker compose logs -f backend
```

**Ver los logs del frontend** (para ver errores de Vite/React):
```bash
docker compose logs -f frontend
```

**Crear nuevas migraciones** (después de modificar `models.py` en Django):
```bash
docker compose exec backend python manage.py makemigrations
```

**Apagar el entorno al terminar el día:**
```bash
docker compose down
```

**Borrar todo y empezar limpio** (¡Cuidado! Esto borra tu base de datos local):
```bash
docker compose down -v
```

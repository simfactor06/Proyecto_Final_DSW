# Ticketek - Sistema de Gestión de Eventos y Entradas

## Stack
- **Backend:** Go (Gin + GORM)
- **Frontend:** React + Vite
- **Base de datos:** MySQL 8
- **Auth:** JWT (SHA-256 passwords)
- **Infraestructura:** Docker + Docker Compose

## Levantar el proyecto

```bash
docker-compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:8080  
- MySQL: localhost:3306

## Endpoints principales

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | /api/auth/register | Público | Registro de usuario |
| POST | /api/auth/login | Público | Login + JWT |
| GET | /api/events | Público | Listar eventos (filtros: category, search) |
| GET | /api/events/:id | Público | Detalle de evento |
| POST | /api/tickets/purchase | Cliente | Comprar entrada |
| GET | /api/tickets/my-tickets | Cliente | Ver mis entradas |
| POST | /api/tickets/:id/cancel | Cliente | Cancelar entrada |
| POST | /api/tickets/:id/transfer | Cliente | Transferir entrada |
| POST | /api/admin/events | Admin | Crear evento |
| PUT | /api/admin/events/:id | Admin | Editar evento |
| DELETE | /api/admin/events/:id | Admin | Eliminar evento |
| GET | /api/admin/events/:id/report | Admin | Reporte de ventas |

## Desarrollo local (sin Docker)

### Backend
```bash
cd backend
go mod tidy
DB_HOST=localhost DB_PORT=3306 DB_USER=ticketek_user DB_PASSWORD=ticketek_pass DB_NAME=ticketek JWT_SECRET=dev_secret go run main.go
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

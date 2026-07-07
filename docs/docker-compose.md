# Docker Compose Guide

The root [docker-compose.yml](../docker-compose.yml) runs the complete local stack:

```text
Browser
  |-- user frontend :3000  ---> user backend :3005  ---> MySQL :3306
  |-- admin frontend :3002 ---> admin backend :3001 ---> MySQL :3306
                                      |
                                      +-----------> MinIO :9000
```

## Files

| File | Purpose |
| --- | --- |
| `docker-compose.yml` | Main local full-stack compose file |
| `.env.docker.example` | Template for local compose variables |
| `.env` | Real local compose variables, ignored by git |
| `mysql-container/initdb/` | SQL files loaded only on first MySQL volume creation |
| `Images-container-final/scripts/minio-init.sh` | Creates MinIO bucket and visible folder prefixes |

## First Run

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

Before building, edit `.env` if needed:

```env
APP_HOST=192.168.1.99
MYSQL_ROOT_PASSWORD=rootpassword
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
```

`APP_HOST` must be reachable from your browser or mobile device. For LAN testing, use your PC LAN IP instead of `localhost`.

## Service Order

Compose starts services in this practical order:

1. `mysql` starts and imports SQL from `mysql-container/initdb` on a fresh volume.
2. `minio` starts object storage.
3. `minio-init` creates the bucket from `MINIO_BUCKET` and sets public download access.
4. `user-backend` waits for MySQL health.
5. `admin-backend` waits for MySQL and MinIO init.
6. `user-frontend` waits for user backend.
7. `admin-frontend` waits for admin backend.

## URLs

With `APP_HOST=192.168.1.99`:

| Service | URL |
| --- | --- |
| User frontend | `http://192.168.1.99:3000` |
| User backend health | `http://192.168.1.99:3005/health` |
| Admin frontend | `http://192.168.1.99:3002` |
| Admin backend health | `http://192.168.1.99:3001/health` |
| MinIO object base | `http://192.168.1.99:9000/ecommerce` |
| MinIO console | `http://192.168.1.99:9001` |
| MySQL | `192.168.1.99:3306` |

## Frontend Build Variables

Next.js `NEXT_PUBLIC_*` values are baked into the frontend images at build time.

If you change `APP_HOST`, ports, API URLs, or MinIO URL, rebuild:

```powershell
docker compose up -d --build user-frontend admin-frontend
```

## Database Initialization

MySQL imports `mysql-container/initdb/*.sql` only when `website2026_mysql_data` is new.

To apply SQL to an existing database, run the migration manually in MySQL.

To intentionally reset local Docker data:

```powershell
docker compose down -v
docker compose up -d --build
```

Use `down -v` carefully. It deletes local MySQL and MinIO data for this compose project.

## Common Commands

```powershell
docker compose ps
docker compose logs -f mysql
docker compose logs -f user-backend
docker compose logs -f admin-backend
docker compose logs -f user-frontend
docker compose logs -f admin-frontend
docker compose restart user-backend admin-backend
docker compose down
```

## Common Problems

| Problem | Fix |
| --- | --- |
| Frontend opens but API requests fail | Check `.env` `APP_HOST`, rebuild frontends, verify backend health URLs |
| Images upload but preview broken | Check `MINIO_PUBLIC_URL` and `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL`; both should use the same reachable host |
| New SQL file not applied | Existing MySQL volume already initialized; run SQL manually or reset volume intentionally |
| Product slug URL returns 404 | Ensure `2026-07-07_seo_friendly_urls.sql` is applied and user backend is restarted |
| Admin upload fails | Check admin backend logs and MinIO credentials |

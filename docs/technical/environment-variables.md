# Environment Variables

Complete reference for all environment configuration in **TechTrends BD**.

---

## Root — Docker Compose (`.env.production.example`)

Used by `docker-compose.production.yml` via `--env-file .env`.

| Variable | Default (example) | Description |
|----------|-------------------|-------------|
| `MYSQL_ROOT_PASSWORD` | `change_me_root_password` | MySQL root password for the `mysql` container |
| `MYSQL_PORT` | `3306` | Host port mapped to MySQL |
| `USER_JWT_SECRET` | `change_me_user_jwt_secret` | JWT secret for user backend (`JWT_SECRET` in container) |
| `ADMIN_JWT_SECRET` | `change_me_admin_jwt_secret` | JWT secret for admin backend |
| `USER_FRONTEND_PORT` | `3000` | Host port for user frontend |
| `USER_BACKEND_PORT` | `3005` | Host port for user backend |
| `ADMIN_FRONTEND_PORT` | `3002` | Host port for admin frontend (maps to container 3000) |
| `ADMIN_BACKEND_PORT` | `3001` | Host port for admin backend |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Public storefront URL (build arg) |
| `NEXT_PUBLIC_USER_API_BASE_URL` | `http://localhost:3005` | Public user API URL (build arg) |
| `NEXT_PUBLIC_ADMIN_API_URL` | `http://localhost:3001/api` | Public admin API URL (build arg) |
| `NEXT_PUBLIC_ADMIN_UPLOAD_URL` | `http://localhost:3001/upload` | Public upload URL (build arg) |
| `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | `http://localhost:9000/products/images/productsimg` | CDN/base URL for product images (build arg) |
| `ADMIN_CLIENT_URL` | `http://localhost:3002` | Admin panel origin for CORS |
| `MINIO_PORT` | `9000` | MinIO API host port mapping |
| `MINIO_CONSOLE_PORT` | `9001` | MinIO console host port mapping |
| `MINIO_ENDPOINT` | `minio` (in Compose) | MinIO hostname (from containers) |
| `USER_CORS_ORIGINS` | `''` | Extra CORS origins for user backend |
| `ADMIN_CORS_ORIGINS` | `''` | Extra CORS origins for admin backend |
| `DB_NAME` | `ecommerce` | Database name (Compose MySQL init) |
| `DB_USER` | `root` | Database user for app containers |
| `MINIO_USE_SSL` | `false` | Use HTTPS for MinIO client |
| `MINIO_ACCESS_KEY` | `admin` | MinIO access key |
| `MINIO_SECRET_KEY` | `password123` | MinIO secret key |
| `MINIO_PUBLIC_URL` | `http://localhost:9000` | Public base URL for uploaded image links |

---

## User Backend (`user/ecommerce_backend_2026/.env.example`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3005` | HTTP listen port |
| `DB_HOST` | **Yes** | `127.0.0.1` | MySQL hostname |
| `DB_USER` | **Yes** | `root` | MySQL username |
| `DB_PASSWORD` | No | `''` | MySQL password |
| `DB_NAME` | **Yes** | `ecommerce` | Database name |
| `DB_PORT` | No | `3306` | MySQL port |
| `JWT_SECRET` | **Yes** | — | Secret for JWT signing (`/admin-login`) |
| `CLIENT_URL` | No | — | Storefront origin for CORS (comma-separated) |
| `CORS_ORIGINS` | No | `''` | Additional allowed CORS origins |
| `NODE_ENV` | No | — | Set to `production` to disable dev CORS bypass |

**Startup validation:** Missing `DB_HOST`, `DB_USER`, `DB_NAME`, or `JWT_SECRET` throws an error at boot.

**Project layout:** `index.js` (entry) → `routes/` → `sql/models/` → `sql/pool.js`.

### Docker Compose mapping

| Container env | Source |
|---------------|--------|
| `JWT_SECRET` | `${USER_JWT_SECRET}` |
| `DB_HOST` | `mysql` |
| `DB_PASSWORD` | `${MYSQL_ROOT_PASSWORD}` |

---

## User Frontend (`user/ecommerce_frontend_2026/.env.example`)

All variables are `NEXT_PUBLIC_*` (exposed to browser at build time).

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3005` | User backend base URL |
| `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | `http://localhost:9000/products/images/productsimg` | Base URL for product images |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | Canonical site URL for SEO/metadata |

### Docker build args

```yaml
NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_USER_API_BASE_URL}
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL: ${NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL}
NEXT_PUBLIC_SITE_URL: ${NEXT_PUBLIC_SITE_URL}
```

---

## Admin Backend (`admin/admin_panel_backend/.env.example`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | HTTP listen port |
| `JWT_SECRET` | **Yes** | — | JWT signing secret for admin auth cookie |
| `CLIENT_URL` | No | `http://localhost:3000,…` | Comma-separated allowed CORS origins |
| `ADMIN_CLIENT_URL` | No | LAN URLs | Additional CORS origins for admin panel |
| `CORS_ORIGINS` | No | `''` | Extra comma-separated origins |
| `DB_HOST` | Yes* | `127.0.0.1` | MySQL hostname |
| `DB_USER` | Yes* | `root` | MySQL username |
| `DB_PASSWORD` | No | `''` | MySQL password |
| `DB_NAME` | Yes* | `ecommerce` | Database name |
| `DB_PORT` | No | `3306` | MySQL port |
| `MINIO_ENDPOINT` | No | `127.0.0.1` | MinIO hostname |
| `MINIO_PORT` | No | `9000` | MinIO port |
| `MINIO_USE_SSL` | No | `false` | `"true"` to enable SSL |
| `MINIO_ACCESS_KEY` | No | `admin` | MinIO access key |
| `MINIO_SECRET_KEY` | No | `password123` | MinIO secret key |
| `MINIO_PUBLIC_URL` | No | `http://localhost:9000` | Public URL prefix for upload responses |
| `NODE_ENV` | No | — | Set to `production` to disable dev CORS bypass |

\*Required for database operations; not validated at startup like user backend.

### CORS behavior

- Origins in `CLIENT_URL`, `ADMIN_CLIENT_URL`, and `CORS_ORIGINS` are allowed.
- In non-production, `localhost`, `127.0.0.1`, and private IPv4 ranges are also allowed.
- Credentials (`cookies`) are enabled.

### Docker Compose mapping

| Container env | Source |
|---------------|--------|
| `JWT_SECRET` | `${ADMIN_JWT_SECRET}` |
| `CLIENT_URL` | `${ADMIN_CLIENT_URL}` |
| `DB_HOST` | `mysql` |
| `MINIO_*` | Root `.env` MinIO variables |

---

## Admin Frontend (`admin/admin_panel_frontend/.env.example`)

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://192.168.1.99:3001/api` | Admin API base (include `/api`) |
| `NEXT_PUBLIC_UPLOAD_URL` | `http://192.168.1.99:3001/upload` | Image upload endpoint |
| `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | `http://192.168.1.146:9000/products/images/productsimg` | Product image CDN base |

**LAN testing note:** Use the same host/IP for all three when testing from phone or another device — not `localhost`.

### Docker build args

```yaml
NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_ADMIN_API_URL}
NEXT_PUBLIC_UPLOAD_URL: ${NEXT_PUBLIC_ADMIN_UPLOAD_URL}
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL: ${NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL}
```

---

## Kubernetes (`k8s/configmap.yaml` + `k8s/secrets.example.yaml`)

### ConfigMap (non-secret)

| Key | Description |
|-----|-------------|
| `DB_HOST` | MySQL service hostname |
| `DB_PORT` | MySQL port |
| `DB_NAME` | Database name |
| `ADMIN_CLIENT_URL` | Admin panel public URL |
| `USER_PUBLIC_URL` | Storefront public URL |
| `USER_API_PUBLIC_URL` | User API public URL |
| `ADMIN_API_PUBLIC_URL` | Admin API public URL |
| `ADMIN_UPLOAD_PUBLIC_URL` | Upload endpoint public URL |
| `PRODUCT_IMAGE_PUBLIC_URL` | Image CDN base |
| `USER_CLIENT_URL` | Storefront origin (user backend CORS) |
| `USER_CORS_ORIGINS` | Extra user backend CORS origins |
| `ADMIN_CORS_ORIGINS` | Extra admin backend CORS origins |
| `NODE_ENV` | `production` in cluster |
| `MINIO_ENDPOINT` | Internal MinIO service name (`minio`) |
| `MINIO_PORT` | MinIO port |
| `MINIO_USE_SSL` | SSL flag |
| `MINIO_PUBLIC_URL` | Public MinIO/CDN URL |

### Secrets (sensitive)

Store in Kubernetes Secrets (see `secrets.example.yaml`):

- `USER_JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `DB_USER`
- `DB_PASSWORD`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`

---

## Quick Reference by Concern

| Concern | Variables |
|---------|-----------|
| Database | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT` |
| User auth JWT | `JWT_SECRET` (user backend) / `USER_JWT_SECRET` (compose) |
| Admin auth JWT | `JWT_SECRET` (admin backend) / `ADMIN_JWT_SECRET` (compose) |
| CORS | `CLIENT_URL`, `ADMIN_CLIENT_URL`, `CORS_ORIGINS` |
| MinIO | `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_PUBLIC_URL` |
| Storefront URLs | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` |
| Admin panel URLs | `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_UPLOAD_URL`, `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` |

---

## Security Reminders

- Never commit `.env` files with real secrets.
- Replace all `change_me_*` placeholders before production.
- Use long random strings for JWT secrets (32+ characters).
- Rotate secrets if exposed.

See [Security Notes](security-notes.md).

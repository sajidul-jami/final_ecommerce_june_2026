# Production Deployment

Deploy **TechTrends BD** using Docker Compose (full stack including MySQL) or Kubernetes (application containers only).

Source reference: `PRODUCTION_DEPLOYMENT.md` at the repository root.

---

## Architecture Overview

### Docker Compose (7 services)

| Service | Image / build | Internal port | Host port (default) |
|---------|---------------|---------------|---------------------|
| `mysql` | `mysql:8.4` | 3306 | 3306 |
| `minio` | `minio/minio` | 9000 / 9001 | 9000 / 9001 |
| `minio-init` | `minio/mc` (one-shot) | — | — |
| `user-backend` | `website2026/user-backend` | 3005 | 3005 |
| `admin-backend` | `website2026/admin-backend` | 3001 | 3001 |
| `user-frontend` | `website2026/user-frontend` | 3000 | 3000 |
| `admin-frontend` | `website2026/admin-frontend` | 3000 | 3002 |

All services share the `website2026` bridge network. Health checks are configured on every long-running container. `minio-init` creates the `products` bucket after MinIO is healthy.

### Kubernetes (4 app deployments)

Manifests in `k8s/`:

| File | Resource |
|------|----------|
| `namespace.yaml` | Namespace `website-2026` |
| `configmap.yaml` | Non-secret configuration |
| `secrets.example.yaml` | Secret template (JWT, DB password, MinIO keys) |
| `user-backend.yaml` | User API Deployment + Service |
| `admin-backend.yaml` | Admin API Deployment + Service |
| `user-frontend.yaml` | Storefront Deployment + Service |
| `admin-frontend.yaml` | Admin panel Deployment + Service |
| `minio.yaml` | MinIO Deployment + Service + PVC |
| `ingress.example.yaml` | Ingress rules (example) |
| `kustomization.yaml` | Kustomize bundle |

**MySQL** must be provided separately (managed DB, existing service, or your own StatefulSet). Set `DB_HOST` in `configmap.yaml` to your MySQL hostname. **MinIO** is included in k8s manifests; create the `products` bucket after deploy (or add a Job mirroring `scripts/minio-init.sh`).

---

## Environment Files

Use these templates — never commit real secrets:

| File | Purpose |
|------|---------|
| `.env.production.example` | Root Docker Compose variables |
| `user/ecommerce_frontend_2026/.env.example` | User frontend |
| `user/ecommerce_backend_2026/.env.example` | User backend |
| `admin/admin_panel_frontend/.env.example` | Admin frontend |
| `admin/admin_panel_backend/.env.example` | Admin backend |

Replace all `change_me_*` values before deploy.

---

## Docker Compose Production

### From repository root

```powershell
cd D:\WEBSITE_2026

Copy-Item .env.production.example .env
# Edit .env — set passwords, JWT secrets, public URLs

docker compose -f docker-compose.production.yml --env-file .env build
docker compose -f docker-compose.production.yml --env-file .env up -d
```

### Default URLs (local Docker)

| Service | URL |
|---------|-----|
| User site | http://localhost:3000 |
| User API | http://localhost:3005 |
| Admin site | http://localhost:3002 |
| Admin API | http://localhost:3001 |

### MySQL initialization

On first start, MySQL loads schema from:

```text
new sql/sql_all.txt
→ mounted as /docker-entrypoint-initdb.d/001_schema.sql
```

**Important:** Init scripts run only when the MySQL volume is empty. To reset locally:

```powershell
docker compose -f docker-compose.production.yml down -v
```

### Create admin user

Insert at least one admin in the `admins` table before using the admin panel. The admin backend uses bcrypt for passwords created via `/api/auth/register`.

### Dockerfiles

Each app has its own Dockerfile:

- `user/ecommerce_backend_2026/Dockerfile`
- `user/ecommerce_frontend_2026/Dockerfile`
- `admin/admin_panel_backend/Dockerfile`
- `admin/admin_panel_frontend/Dockerfile`

Both Next.js frontends use `output: 'standalone'` for optimized container images.

---

## Kubernetes Deployment

### Pre-apply checklist

1. **Edit `k8s/configmap.yaml`** — replace all `example.com` URLs with your domains.
2. **Create secrets** — copy `k8s/secrets.example.yaml` to a private file or use sealed/external secrets. Set:
   - `USER_JWT_SECRET`
   - `ADMIN_JWT_SECRET`
   - `DB_USER` / `DB_PASSWORD`
   - `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY`
3. **Build and push images** to your container registry.
4. **Update image names** in the four Deployment YAML files (replace `registry.example.com/website2026/...`).

### Build images

```powershell
docker build -t registry.example.com/website2026/user-backend:latest .\user\ecommerce_backend_2026

docker build -t registry.example.com/website2026/admin-backend:latest .\admin\admin_panel_backend

docker build -t registry.example.com/website2026/user-frontend:latest `
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.example.com `
  --build-arg NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=https://cdn.example.com/products/images/productsimg `
  --build-arg NEXT_PUBLIC_SITE_URL=https://shop.example.com `
  .\user\ecommerce_frontend_2026

docker build -t registry.example.com/website2026/admin-frontend:latest `
  --build-arg NEXT_PUBLIC_API_URL=https://admin-api.example.com/api `
  --build-arg NEXT_PUBLIC_UPLOAD_URL=https://admin-api.example.com/upload `
  --build-arg NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=https://cdn.example.com/products/images/productsimg `
  .\admin\admin_panel_frontend
```

### Apply manifests

```powershell
kubectl apply -k .\k8s
```

### ConfigMap defaults (`k8s/configmap.yaml`)

| Key | Example value |
|-----|---------------|
| `DB_HOST` | `mysql` |
| `DB_NAME` | `ecommerce` |
| `ADMIN_CLIENT_URL` | `https://admin.example.com` |
| `USER_PUBLIC_URL` | `https://shop.example.com` |
| `USER_API_PUBLIC_URL` | `https://api.example.com` |
| `ADMIN_API_PUBLIC_URL` | `https://admin-api.example.com/api` |
| `PRODUCT_IMAGE_PUBLIC_URL` | `https://cdn.example.com/products/images/productsimg` |
| `MINIO_ENDPOINT` | `minio.example.internal` |

### NEXT_PUBLIC build-time variables

`NEXT_PUBLIC_*` values are **baked into Next.js client bundles at build time**. When API or CDN domains change in Kubernetes, **rebuild and redeploy frontend images**.

---

## Database Notes

Shared schema: `new sql/sql_all.txt` (or copy under user backend).

Tables include:

- `admins`, `users`, `category`, `products`
- `cart`, `orders`, `details`, `payments`
- `user_addresses`, `product_reviews`, `support_tickets`, `product_images`
- Order delivery snapshot columns and performance indexes

---

## Verification Before Release

```powershell
cd user/ecommerce_frontend_2026
npm run lint
npm run build

cd admin/admin_panel_frontend
npm run lint
npm run build

cd user/ecommerce_backend_2026
node --check index.js

cd admin/admin_panel_backend
node --check script.js
```

### Health endpoints

| Service | Endpoint |
|---------|----------|
| User backend | `GET /health` |
| Admin backend | `GET /health` |

---

## Production Checklist

- [ ] HTTPS for all public frontend and API domains
- [ ] Strong `USER_JWT_SECRET`, `ADMIN_JWT_SECRET`, and MySQL root password
- [ ] Managed MySQL or persistent volume for database
- [ ] MinIO/S3 with persistent storage for product images (`products` bucket)
- [ ] Run MinIO bucket init (`scripts/minio-init.sh` or `minio-init` compose service)
- [ ] Restrict admin API CORS with `CLIENT_URL` / `ADMIN_CLIENT_URL`
- [ ] Rebuild frontend images when public API/CDN URLs change
- [ ] Create at least one admin user before go-live
- [ ] Review [Security Notes](security-notes.md) and apply hardening where possible
- [ ] Place admin API behind VPN, IP allowlist, or internal network

---

## Included Fixes (from upstream)

- Admin products page supports add, edit, and delete
- Admin product image upload URL is environment-driven
- Admin backend DB, CORS, and MinIO settings are environment-driven
- Admin backend exposes `/health`
- Both Next.js frontends use `output: 'standalone'`
- Dockerfiles for all four app containers
- Kubernetes manifests in `k8s/`
- `docker-compose.production.yml` for local/server Docker deploys

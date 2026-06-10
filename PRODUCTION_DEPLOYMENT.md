# WEBSITE_2026 Production Deployment

This workspace has four application containers and one database container:

1. `user-frontend` - customer Next.js storefront, port `3000`
2. `user-backend` - customer Express API, port `3005`
3. `admin-frontend` - admin Next.js panel, port `3000` inside container, usually exposed as `3002`
4. `admin-backend` - admin Express API, port `3001`
5. `mysql` - database container, port `3306`

Product images are stored in MinIO/S3-compatible storage. For the 5-container target, MinIO is treated as an external service and configured by `.env`.

## Important Fixes Included

- Admin products page can now add, edit, and delete products.
- Admin product image upload URL is environment-driven.
- Admin backend DB, CORS, and MinIO settings are environment-driven.
- Admin backend now has `/health`.
- Both Next.js frontends use `output: 'standalone'` for Docker/Kubernetes.
- Dockerfiles are available for the four app containers.
- Kubernetes manifests are available in `k8s/`.
- `docker-compose.production.yml` runs MySQL plus the four app containers.

## Environment Files

Use these files as templates:

- Root production compose env: `.env.production.example`
- User frontend: `user/ecommerce_frontend_2026/.env.example`
- User backend: `user/ecommerce_backend_2026/.env.example`
- Admin frontend: `admin/admin_panel_frontend/.env.example`
- Admin backend: `admin/admin_panel_backend/.env.example`

Never commit real production secrets. Replace all `change_me_*` values before deploy.

## Docker Compose Production

From `D:\WEBSITE_2026`:

```powershell
Copy-Item .env.production.example .env
docker compose -f docker-compose.production.yml --env-file .env build
docker compose -f docker-compose.production.yml --env-file .env up -d
```

Default local URLs:

- User site: `http://localhost:3000`
- User API: `http://localhost:3005`
- Admin site: `http://localhost:3002`
- Admin API: `http://localhost:3001`

The MySQL container initializes from:

```text
user/ecommerce_backend_2026/new sql/sql_all.txt
```

If the MySQL volume already exists, schema init files will not rerun automatically. For a fresh local reset only:

```powershell
docker compose -f docker-compose.production.yml down -v
```

## Kubernetes Deploy

The `k8s/` folder includes manifests for the four app containers only. Provide MySQL separately as a managed DB, existing service, or your own StatefulSet. The app manifests expect DB host `mysql` by default.

Before applying:

1. Edit `k8s/configmap.yaml` and replace all `example.com` URLs.
2. Copy `k8s/secrets.example.yaml` to a private secret file or apply equivalent sealed/external secrets.
3. Build and push images to your registry.
4. Replace `registry.example.com/website2026/...` image names in the four Deployment YAML files.

Build example:

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

Important: `NEXT_PUBLIC_*` values are baked into Next.js client bundles at build time. For Kubernetes, rebuild frontend images when public API/CDN/domain values change.

Apply:

```powershell
kubectl apply -k .\k8s
```

## Database Notes

The shared production schema is:

```text
user/ecommerce_backend_2026/new sql/sql_all.txt
```

It includes:

- `admins`
- `users`
- `category`
- `products`
- `cart`
- `orders`
- `details`
- `payments`
- `user_addresses`
- `product_reviews`
- `support_tickets`
- `product_images`
- order delivery snapshot columns
- useful indexes

Create at least one admin user in the `admins` table before using the admin panel. The current admin backend compares stored password text directly, so use a strong private admin password and keep the admin API behind HTTPS and restricted access.

## Verification Commands

Run these before release:

```powershell
cd D:\WEBSITE_2026\user\ecommerce_frontend_2026
npm run lint
npm run build

cd D:\WEBSITE_2026\admin\admin_panel_frontend
npm run lint
npm run build

cd D:\WEBSITE_2026\user\ecommerce_backend_2026
node --check index.js

cd D:\WEBSITE_2026\admin\admin_panel_backend
node --check script.js
```

Health endpoints:

- User backend: `/health`
- Admin backend: `/health`

## Production Checklist

- Use HTTPS for all public frontend and API domains.
- Set strong values for `USER_JWT_SECRET`, `ADMIN_JWT_SECRET`, and MySQL password.
- Use managed MySQL or persistent storage for MySQL.
- Use external MinIO/S3 with persistent storage for product images.
- Restrict admin API CORS with `CLIENT_URL`.
- Rebuild frontend images whenever public API/CDN URLs change.
- Keep `docker-compose.production.yml` for local/server Docker deploys and `k8s/` for cluster deploys.

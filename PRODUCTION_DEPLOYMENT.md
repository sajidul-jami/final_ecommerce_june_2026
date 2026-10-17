# WEBSITE_2026 Production Deployment

This workspace runs four application containers, MySQL, and an Nginx reverse proxy:

1. `user-frontend` - customer Next.js storefront, internal port `3000`
2. `user-backend` - customer Express API, internal port `3005`
3. `admin-frontend` - admin Next.js panel, internal port `3000`
4. `admin-backend` - admin Express API, internal port `3001`
5. `mysql` - database container, port `3306`
6. `nginx` - public entry point for the storefront, APIs, and admin site, port `80`

Product images are stored in the configured MinIO/S3-compatible service. This compose file includes MinIO with persistent storage; a public CDN or object URL can be set through `.env`.

## Important Fixes Included

- Admin products page can now add, edit, and delete products.
- Admin product image upload URL is environment-driven.
- Admin backend DB, CORS, and MinIO settings are environment-driven.
- Admin backend now has `/health`.
- Both Next.js frontends use `output: 'standalone'` for Docker/Kubernetes.
- Dockerfiles are available for the four app containers.
- Kubernetes manifests are available in `k8s/`.
- `docker-compose.production.yml` runs MySQL plus the four app containers.
- Nginx caches anonymous storefront listing and product detail HTML responses on a shared Docker volume. Product/category, offer, brand, slider, and site-setting changes, plus checkout stock/sales changes, empty that cache and request Next.js revalidation.

## Environment Files

Use these files as templates:

- Root production compose env: `.env.production.example`
- User frontend: `user/ecommerce_frontend_2026/.env.example`
- User backend: `user/ecommerce_backend_2026/.env.example`
- Admin frontend: `admin/admin_panel_frontend/.env.example`
- Admin backend: `admin/admin_panel_backend/.env.example`

Never commit real production secrets. Replace all `change_me_*` values before deploy.
Set the four Nginx hostnames (`SHOP_DOMAIN`, `USER_API_DOMAIN`, `ADMIN_DOMAIN`, `ADMIN_API_DOMAIN`) to the DNS names for this server. Set a long random `PRODUCT_CACHE_REVALIDATION_SECRET` and use the same value for all replicas if scaling the admin backend.

## Docker Compose Production

From `D:\WEBSITE_2026`:

```powershell
Copy-Item .env.production.example .env
docker compose -f docker-compose.production.yml --env-file .env build
docker compose -f docker-compose.production.yml --env-file .env up -d
```

Public URLs (DNS should point to this server):

- User site: `https://SHOP_DOMAIN`
- User API: `https://USER_API_DOMAIN`
- Admin site: `https://ADMIN_DOMAIN`
- Admin API: `https://ADMIN_API_DOMAIN`

Nginx listens on `HTTP_PORT` (default `80`). Put a TLS terminator such as a cloud load balancer or managed ingress in front of it, or add your certificate configuration to Nginx before exposing it directly to the internet. The TLS terminator must preserve the original `Host` and set `X-Forwarded-Proto: https`. The app containers are internal to the Compose network; Nginx is the only public web entry point. MySQL and MinIO ports remain separately configurable.

On storefront content changes and successful checkouts, the backend clears the shared Nginx cache volume and asks the storefront to revalidate its product data. If a backend is deployed outside this compose network, set `PRODUCT_CACHE_REVALIDATION_URL` to a reachable storefront revalidation endpoint and provide an equivalent shared-cache purge mechanism.

Check `X-Product-Page-Cache` on `/`, `/category/<slug>`, `/brand/<slug>`, and `/product/<slug>` responses (`MISS`, then `HIT`) to confirm caching. Requests with cookies, authorization headers, or Next.js flight headers bypass Nginx cache.

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

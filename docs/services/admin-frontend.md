# Admin Frontend

Path: `admin/admin_panel_frontend`

The admin frontend is the store management panel. It is a Next.js app that talks to the admin backend for product management, orders, customers, brands, site settings, uploads, and content.

## Runtime

| Item | Value |
| --- | --- |
| Framework | Next.js 16, React 19 |
| Local dev port | Usually `3002` |
| Docker container port | `3000` |
| Docker host port | `${ADMIN_FRONTEND_PORT:-3002}` |
| Dockerfile | `admin/admin_panel_frontend/Dockerfile` |

## Important Env

| Variable | Example | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | `http://192.168.1.99:3001/api` | Admin API base URL |
| `NEXT_PUBLIC_UPLOAD_URL` | `http://192.168.1.99:3001/upload` | Admin upload endpoint |
| `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | `http://192.168.1.99:9000/ecommerce` | Public MinIO image base |

These values are baked into the Docker image during `next build`.

## Main Modules

| Module | Purpose |
| --- | --- |
| Products | Create/edit products, images, brand, country of origin, status |
| Brands | Brand image upload/preview/update/delete, description, status, SEO fields |
| Orders | Order list/detail, delivery zone/charge, customer/guest info |
| Users/Customers | Registered customers and guest customers traced from orders |
| Site Settings | Website name/logo/footer/favicon/contact/SEO/tracking/delivery charges |
| Content | CMS-style content and supporting settings |

## Upload Flow

1. Admin selects an image in the panel.
2. Admin frontend posts to `NEXT_PUBLIC_UPLOAD_URL`.
3. Admin backend stores the object in MinIO.
4. Admin backend returns a public URL/object key.
5. Frontend shows preview using `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL`.

## Local Commands

```powershell
cd admin/admin_panel_frontend
npm install
npm run dev -- -p 3002
npm run lint
npm run build
```

## Docker

The root compose file builds this service as `website2026/admin-frontend:local`.

```powershell
docker compose up -d --build admin-frontend
docker compose logs -f admin-frontend
```

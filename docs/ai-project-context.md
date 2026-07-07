# AI Project Context

This document is for another AI or developer who needs to understand the repository quickly and avoid common mistakes.

## Project Summary

`WEBSITE_2026` is a Bangladesh ecommerce platform with:

- Customer storefront: Next.js app
- Customer API: Express app
- Admin panel: Next.js app
- Admin API: Express app
- MySQL database
- MinIO object storage for images

The two frontends are separate applications. The two backends are also separate applications. They share one MySQL database.

## Repository Map

| Path | Meaning |
| --- | --- |
| `user/ecommerce_frontend_2026` | Customer Next.js storefront |
| `user/ecommerce_backend_2026` | Customer Express API |
| `admin/admin_panel_frontend` | Admin Next.js panel |
| `admin/admin_panel_backend` | Admin Express API |
| `mysql-container/initdb` | Docker MySQL initial schema and migrations |
| `sql scema` | Copy-paste SQL migration files for existing non-Docker MySQL |
| `Images-container-final` | MinIO compose/init helper files |
| `docs` | Documentation |
| `docker-compose.yml` | Local full-stack Docker Compose |
| `.env.docker.example` | Compose env template |

## Runtime Topology

```text
Customer browser
  -> user frontend :3000
  -> user backend :3005
  -> MySQL :3306

Admin browser
  -> admin frontend :3002
  -> admin backend :3001
  -> MySQL :3306
  -> MinIO :9000
```

Images are uploaded through the admin backend. Public pages read image URLs through the public MinIO URL.

## Default Docker URLs

If `.env` uses `APP_HOST=192.168.1.99`:

| Service | URL |
| --- | --- |
| User frontend | `http://192.168.1.99:3000` |
| User backend | `http://192.168.1.99:3005` |
| Admin frontend | `http://192.168.1.99:3002` |
| Admin backend | `http://192.168.1.99:3001` |
| MinIO API | `http://192.168.1.99:9000` |
| MinIO console | `http://192.168.1.99:9001` |

## Database Rules

- Docker fresh installs load SQL from `mysql-container/initdb`.
- Existing non-Docker databases should use files in `sql scema`.
- Do not assume a new SQL file auto-applies to an existing Docker volume.
- Slug migrations are important for SEO URLs.
- Current database name is normally `ecommerce`.

## Recent Feature Areas

The project has been expanded with:

- Brand module with image, description, status, SEO fields, slug.
- Brand navigation and `/brand/[slug]` pages.
- Product brand selection and brand links on product detail.
- Country of origin on products.
- Product review summary before Buy Now with clickable jump to reviews.
- Product share buttons after Buy Now.
- Dynamic site settings and dynamic footer/SEO.
- Guest checkout required fields aligned with normal checkout.
- Inside Dhaka/Outside Dhaka delivery zones and charges.
- Guest customer tracing in admin through orders.
- SEO-friendly slug URLs for products, categories, brands, tags, CMS pages.
- Old product ID URLs redirecting to slug URLs.

## Important Implementation Notes

- Product slug URL route is `user/ecommerce_frontend_2026/app/product/[slug]/page.js`.
- Legacy product route is `user/ecommerce_frontend_2026/app/singleproduct/[id]/page.js`.
- Product detail UI is mostly in `user/ecommerce_frontend_2026/app/singleproduct/[id]/ProductDetailsClient.js`.
- Shared frontend API constants live in `user/ecommerce_frontend_2026/app/lib/api.js`.
- Site settings helper lives in `user/ecommerce_frontend_2026/app/lib/siteSettings.js`.
- User backend product/category/brand/CMS endpoints are in `user/ecommerce_backend_2026/index.js`.
- Admin backend content/settings routes are in `admin/admin_panel_backend/routes/admin_routes/content_routes.js`.
- Admin product SQL logic is in `admin/admin_panel_backend/sql/product_model.js`.
- Admin order/customer SQL logic is in `admin/admin_panel_backend/sql/order_model.js` and `customer_model.js`.

## Coding Rules For Future Work

- Preserve user changes. The worktree may be dirty.
- Do not reset or checkout files unless explicitly asked.
- For SQL changes, create both:
  - `mysql-container/initdb/YYYY-MM-DD_feature.sql` for new Docker installs.
  - `sql scema/YYYY-MM-DD_feature.sql` for existing DB copy-paste use.
- For frontend public URLs, remember `NEXT_PUBLIC_*` values are build-time values.
- If changing Docker public host/ports, rebuild frontends.
- If adding image uploads, keep MinIO object paths consistent with existing public image base.
- If adding slug URLs, keep old URLs redirecting where possible.
- If adding product fields, update admin create/edit, admin backend model, user backend response, product page display, and SQL migration.

## Verification Checklist

Use the checks relevant to the change:

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

For Docker:

```powershell
docker compose config
docker compose up -d --build
docker compose ps
docker compose logs -f user-backend
docker compose logs -f admin-backend
```

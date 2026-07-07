# User Backend

Path: `user/ecommerce_backend_2026`

The user backend is the public customer API. It serves storefront data, product details, reviews, checkout, customer auth/profile, categories, brands, CMS pages, and site settings.

## Runtime

| Item | Value |
| --- | --- |
| Framework | Express 4 |
| Local/Docker port | `3005` |
| Entry file | `index.js` |
| Dockerfile | `user/ecommerce_backend_2026/Dockerfile` |
| Health endpoint | `GET /health` |

## Important Env

| Variable | Meaning |
| --- | --- |
| `PORT` | API port, default `3005` |
| `DB_HOST` | MySQL host, `mysql` in Docker |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name, usually `ecommerce` |
| `DB_PORT` | MySQL port |
| `JWT_SECRET` | Customer JWT signing secret |
| `CLIENT_URL` | Storefront origin |
| `CORS_ORIGINS` | Optional comma-separated allowed origins |

## Important Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /health` | Health and database check |
| `GET /products` | Product listing with category, brand, tag, search, pagination, sorting |
| `GET /product/:slug` | SEO product detail by slug or ID fallback |
| `GET /singleproducts/:id` | Legacy product detail by ID |
| `GET /categories` | Category list |
| `GET /categories/:slug` | Category detail by slug/code |
| `GET /brands` | Active brand list |
| `GET /brands/:slug` | Active brand detail |
| `GET /cms-pages/:slug` | CMS page by slug |
| `GET /site-settings` | Dynamic site/footer/SEO/settings |
| `GET /products/:productId/reviews` | Product reviews |
| `POST /checkout` | Auth checkout |
| `POST /guest-checkout` | Guest checkout |

## Responsibilities

- Reads public catalog data from MySQL.
- Applies active offers to product responses.
- Supports SEO-friendly product/category/brand/tag/CMS URLs.
- Enforces checkout required fields, including delivery zone.
- Calculates delivery charge from `site_settings`.
- Saves guest checkout data so admin can trace guest customers through orders.
- Serves dynamic site settings to the frontend.

## Local Commands

```powershell
cd user/ecommerce_backend_2026
npm install
npm start
node --check index.js
```

## Docker

The root compose file builds this service as `website2026/user-backend:local`.

```powershell
docker compose up -d --build user-backend
docker compose logs -f user-backend
```

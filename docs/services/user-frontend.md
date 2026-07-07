# User Frontend

Path: `user/ecommerce_frontend_2026`

The user frontend is the public customer storefront. It is a Next.js app that reads products, categories, brands, CMS pages, reviews, site settings, and checkout APIs from the user backend.

## Runtime

| Item | Value |
| --- | --- |
| Framework | Next.js 16, React 18 |
| Local dev port | `3000` |
| Docker container port | `3000` |
| Docker host port | `${USER_FRONTEND_PORT:-3000}` |
| Dockerfile | `user/ecommerce_frontend_2026/Dockerfile` |

## Important Env

| Variable | Example | Meaning |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://192.168.1.99:3005` | User backend public URL |
| `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | `http://192.168.1.99:9000/ecommerce` | MinIO bucket public image base |
| `NEXT_PUBLIC_SITE_URL` | `http://192.168.1.99:3000` | Canonical site URL for SEO |

These values are baked into the Docker image during `next build`. Rebuild the frontend after changing them.

## Key Routes

| Route | Purpose |
| --- | --- |
| `/` | Homepage with products/categories |
| `/product/[slug]` | SEO product detail URL |
| `/singleproduct/[id]` | Old product URL; redirects to slug when possible |
| `/category/[slug]` | Category product listing |
| `/brand/[slug]` | Brand landing page with products |
| `/tag/[slug]` | Tag product listing |
| `/page/[slug]` | CMS page |
| `/cart` | Cart page |
| `/checkout` | Checkout page |
| `/user_profile` | Customer account/profile |

## Main Integrations

- Product cards and search suggestions link to `/product/{slug}`.
- Product detail shows brand, country of origin, sold count, dynamic review summary, clickable review jump, and share buttons.
- Navbar and footer load dynamic site settings.
- Brand dropdown loads active brands.
- Checkout sends delivery zone and delivery charge data to the user backend.

## Local Commands

```powershell
cd user/ecommerce_frontend_2026
npm install
npm run dev
npm run lint
npm run build
```

## Docker

The root compose file builds this service as `website2026/user-frontend:local`.

```powershell
docker compose up -d --build user-frontend
docker compose logs -f user-frontend
```

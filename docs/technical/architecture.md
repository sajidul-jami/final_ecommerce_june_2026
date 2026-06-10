# Architecture

System architecture and design decisions for **TechTrends BD**.

## System Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CUSTOMERS                                       │
│                         (Web browsers, mobile)                               │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  user/ecommerce_frontend_2026          Next.js 16 (port 3000)               │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • App Router pages (/, /cart, /checkout, /user_profile, …)                 │
│  • CartContext → localStorage                                               │
│  • UserContext → localStorage (no JWT on customer API)                      │
│  • BDT currency formatting, SEO (sitemap, metadata)                         │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ REST JSON
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  user/ecommerce_backend_2026           Express 4 (port 3005)                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • Public product/category catalog                                          │
│  • Customer auth (bcrypt; legacy plaintext upgraded on login)                │
│  • Checkout with stock locking (FOR UPDATE)                                 │
│  • Addresses, reviews, support tickets                                      │
│  • /health                                                                  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          ▼                        ▼                        ▼
┌──────────────────┐   ┌──────────────────┐   ┌──────────────────────────┐
│  MySQL 8         │   │  MinIO :9000     │   │  (no direct customer     │
│  database:       │   │  bucket: products│   │   upload — images via    │
│  ecommerce       │   │  path: images/   │   │   admin backend only)    │
│                  │   │  productsimg/    │   │                          │
└────────▲─────────┘   └────────▲─────────┘   └──────────────────────────┘
         │                        │
         │                        │
┌────────┴────────────────────────┴──────────────────────────────────────────┐
│  admin/admin_panel_backend              Express 5 (port 3001)                │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • JWT in httpOnly cookie (verifyToken middleware)                          │
│  • Products, categories, orders, sales, customers CRUD                       │
│  • POST /upload → MinIO                                                     │
│  • CORS restricted by CLIENT_URL / ADMIN_CLIENT_URL                          │
│  • /health                                                                  │
└──────────────────────────────────┬──────────────────────────────────────────┘
                                   │ REST + cookies
                                   ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  admin/admin_panel_frontend             Next.js 16 (port 3002)              │
│  ─────────────────────────────────────────────────────────────────────────  │
│  • /login, /admin/dashboard, /admin/orders, /admin/products, …            │
│  • credentials: 'include' for cookie auth                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                   ▲
                                   │ HTTPS
┌──────────────────────────────────┴──────────────────────────────────────────┐
│                              ADMINISTRATORS                                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Repository Layout

| Path | Role |
|------|------|
| `user/ecommerce_frontend_2026/` | Customer storefront (Next.js App Router) |
| `user/ecommerce_backend_2026/index.js` | Customer API entry (thin) |
| `user/ecommerce_backend_2026/routes/` | Route modules |
| `user/ecommerce_backend_2026/sql/models/` | Data access models |
| `admin/admin_panel_frontend/` | Admin UI |
| `admin/admin_panel_backend/script.js` | Admin API entry point |
| `admin/admin_panel_backend/routes/admin_routes/` | Route modules |
| `admin/admin_panel_backend/sql/` | Data access models |
| `new sql/sql_all.txt` | Full schema (also copied under user backend for Docker init) |
| `docker-compose.production.yml` | 7-service stack (MySQL, MinIO, init, 4 apps) |
| `k8s/` | K8s manifests for 4 apps + MinIO (MySQL external) |

## Design Decisions

### Dual backends

Customer and admin concerns are split into separate Express applications:

| Aspect | User backend | Admin backend |
|--------|--------------|---------------|
| Express version | 4.x | 5.x |
| Port | 3005 | 3001 |
| Auth | No middleware; user id in request body | JWT in httpOnly cookie |
| Password storage | bcrypt hash in `users.password` | bcrypt hash in `admins.password` |
| Image upload | No | MinIO via multer |
| CORS | `CLIENT_URL` / `CORS_ORIGINS` (+ dev LAN bypass) | Origin whitelist |

**Rationale:** Simpler customer API for storefront needs; stricter admin API with cookie auth and upload pipeline. Both share one database schema.

### Client-side cart

The storefront `CartContext` persists cart items in **browser localStorage**, not the server `cart` table on every add/remove.

| Behavior | Implementation |
|----------|----------------|
| Add to cart | `localStorage.setItem('cart', …)` |
| Checkout selection | `sessionStorage.checkoutItems` |
| Server cart table | Cleared on successful checkout (`DELETE FROM cart WHERE user_id = ?`) |

**Trade-off:** Fast UX without auth for browsing; cart not portable across devices until checkout.

### Authentication flows

#### Customer (storefront)

1. `POST /login` or `POST /signup` on user backend
2. User object (no password) returned in JSON
3. Frontend stores user in `localStorage`
4. Subsequent API calls pass `user_id` in body — **no bearer token or session validation**

#### Admin (panel)

1. `POST /api/auth/login` with email + password
2. Admin backend verifies bcrypt hash, signs JWT
3. JWT set as `httpOnly` cookie `token` (7-day expiry)
4. Protected routes use `verifyToken` middleware reading `req.cookies.token`
5. Frontend fetch uses `credentials: 'include'`

#### Legacy admin login on user backend

`POST /admin-login` on the **user** backend also exists — compares plaintext admin password and returns a JWT. The admin panel uses the **admin** backend exclusively.

### MinIO object storage

| Setting | Value |
|---------|-------|
| Bucket | `products` |
| Upload route | `POST /upload` (admin backend, field name `photo`) |
| Object key | `images/productsimg/{originalFilename}` |
| Public URL | `{MINIO_PUBLIC_URL}/products/images/productsimg/{filename}` |

Customer frontend builds image URLs from `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` + product `photo` filename.

Docker Compose includes a **MinIO** container plus a one-shot `minio-init` job that creates the `products` bucket. Kubernetes manifests include MinIO Deployment + PVC; MySQL remains external/managed in k8s.

### SEO

The customer frontend implements:

- Dynamic `metadata` on home page (search/category canonical URLs)
- `app/sitemap.js` — product and category URLs
- Server-side category name resolution for page titles
- Semantic product URLs: `/singleproduct/[id]`

Admin panel is not indexed (internal tool).

### Checkout and inventory

Checkout uses a **database transaction** with row-level locking:

1. `SELECT … FOR UPDATE` on product rows
2. Validate stock per line item
3. Insert `orders`, `details`, `payments`
4. Decrement `products.quantity`
5. Clear server-side cart for user
6. Commit or rollback on error

### Order delivery snapshot

Orders store delivery fields (`delivery_name`, `delivery_phone`, `delivery_address`, `delivery_city`, `delivery_address_id`) at placement time so fulfilment data is preserved if the customer updates their profile later.

## Deployment Topologies

### Local / single-server Docker

`docker-compose.production.yml` runs MySQL, MinIO, and 4 app containers on a shared `website2026` network with health checks.

### Kubernetes

`k8s/` deploys 4 app Deployments + ConfigMap + Secrets. MySQL is expected as a managed service or separate StatefulSet at hostname `mysql`.

## Data Flow: Place Order

```
Cart (localStorage)
    → Buy Now → sessionStorage.checkoutItems
    → /checkout page (logged-in user)
    → POST /update-user (delivery info)
    → POST /checkout { user_id, products[], payment_method, delivery_* }
    → User backend transaction
        → orders + details + payments
        → stock decrement
        → cart table clear
    → Response { orderId, totalAmount }
    → Frontend clears local cart items
```

## Further Reading

- [Local Development](local-development.md)
- [Database Schema](database-schema.md)
- [Security Notes](security-notes.md)

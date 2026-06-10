# TechTrends BD — Documentation

Welcome to the documentation for **TechTrends BD**, a full-stack ecommerce platform built for Bangladesh. This repository contains a customer storefront, customer API, admin panel, and admin API sharing a single MySQL database and MinIO object storage for product images.

## Applications

| Application | Path | Stack | Default Port | URL (local) |
|-------------|------|-------|--------------|-------------|
| Customer storefront | `user/ecommerce_frontend_2026` | Next.js 16, React 18, Tailwind CSS | 3000 | http://localhost:3000 |
| Customer API | `user/ecommerce_backend_2026` | Express 4, MySQL2, JWT | 3005 | http://localhost:3005 |
| Admin panel | `admin/admin_panel_frontend` | Next.js 16, React 19, Tailwind CSS 4 | 3002 | http://localhost:3002 |
| Admin API | `admin/admin_panel_backend` | Express 5, MySQL2, JWT, MinIO | 3001 | http://localhost:3001 |
| Database | MySQL 8 | Schema in `new sql/sql_all.txt` | 3306 | — |
| Object storage | MinIO (external) | S3-compatible bucket `products` | 9000 | http://localhost:9000 |

## Documentation Sections

### User guides

End-user and operator documentation for shopping and managing the store:

- [User Guide Index](user-guide/README.md)
- [Customer Shopping Guide](user-guide/customer-shopping-guide.md) — browse, cart, checkout, account, reviews, support
- [Admin Panel Guide](user-guide/admin-panel-guide.md) — dashboard, orders, products, categories, customers, sales

### Technical documentation

Developer and DevOps documentation:

- [Technical Index](technical/README.md)
- [Architecture](technical/architecture.md) — system design, repo layout, key decisions
- [Local Development](technical/local-development.md) — run all services on your machine
- [Production Deployment](technical/production-deployment.md) — Docker Compose and Kubernetes
- [Environment Variables](technical/environment-variables.md) — all configuration keys
- [Database Schema](technical/database-schema.md) — tables, relationships, enums
- [User Backend API](technical/api-user-backend.md) — customer API reference
- [Admin Backend API](technical/api-admin-backend.md) — admin API reference
- [Security Notes](technical/security-notes.md) — known issues and hardening recommendations

## Quick Start for Developers

### Prerequisites

- Node.js 18+
- MySQL 8.x
- MinIO (or compatible S3 storage) for product image uploads
- npm

### 1. Database

Import the schema:

```powershell
mysql -u root -p < "new sql/sql_all.txt"
```

Create at least one row in the `admins` table before using the admin panel (see [Database Schema](technical/database-schema.md)).

### 2. Environment files

Copy each app's `.env.example` to `.env` and adjust values:

| App | Template |
|-----|----------|
| User frontend | `user/ecommerce_frontend_2026/.env.example` |
| User backend | `user/ecommerce_backend_2026/.env.example` |
| Admin frontend | `admin/admin_panel_frontend/.env.example` |
| Admin backend | `admin/admin_panel_backend/.env.example` |

For Docker production, use the root `.env.production.example`.

### 3. Start services

In separate terminals:

```powershell
# User backend (port 3005)
cd user/ecommerce_backend_2026
npm install && npm start

# User frontend (port 3000)
cd user/ecommerce_frontend_2026
npm install && npm run dev

# Admin backend (port 3001)
cd admin/admin_panel_backend
npm install && npm start

# Admin frontend (port 3002)
cd admin/admin_panel_frontend
npm install && npm run dev -- -p 3002
```

### 4. Verify

| Check | Command / URL |
|-------|---------------|
| User API health | `GET http://localhost:3005/health` |
| Admin API health | `GET http://localhost:3001/health` |
| Storefront | http://localhost:3000 |
| Admin panel | http://localhost:3002 |

For full setup including MySQL and MinIO, see [Local Development](technical/local-development.md).

## Related Files in the Repository

| File | Purpose |
|------|---------|
| `PRODUCTION_DEPLOYMENT.md` | Deployment quick reference at repo root |
| `docker-compose.production.yml` | Production Docker Compose stack |
| `k8s/` | Kubernetes manifests (apps only; MySQL external) |
| `new sql/sql_all.txt` | Canonical database schema |

## Currency and Locale

All customer-facing prices use **BDT (Bangladeshi Taka)** formatted with `en-BD` locale. Payment methods supported at checkout: Cash On Delivery, bKash, Nagad, and Card.

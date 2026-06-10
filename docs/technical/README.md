# Technical Documentation

Developer and DevOps reference for **TechTrends BD** (WEBSITE_2026).

## Stack Summary

| Layer | Technology | Version (approx.) |
|-------|------------|-------------------|
| Customer frontend | Next.js, React, Tailwind CSS | Next.js 16.2.x, React 18 |
| Customer backend | Express, mysql2, jsonwebtoken | Express 4.19.x |
| Admin frontend | Next.js, React, Tailwind CSS | Next.js 16.2.x, React 19 |
| Admin backend | Express, mysql2, jsonwebtoken, minio, multer | Express 5.2.x |
| Database | MySQL | 8.4 (Docker) / 8.x |
| Object storage | MinIO | S3-compatible API |
| Container runtime | Docker, Kubernetes (kustomize) | — |

## Architecture at a Glance

```
Browser (customer) ──► Next.js storefront :3000
                            │
                            ▼
                       Express user API :3005 ──► MySQL (ecommerce)
                            │
Browser (admin) ──► Next.js admin panel :3002
                            │
                            ▼
                       Express admin API :3001 ──► MySQL
                            │
                            └──► MinIO :9000 (product images)
```

## Repository Layout

```
WEBSITE_2026/
├── user/
│   ├── ecommerce_frontend_2026/    # Customer Next.js app
│   └── ecommerce_backend_2026/     # Customer Express API
├── admin/
│   ├── admin_panel_frontend/       # Admin Next.js app
│   └── admin_panel_backend/        # Admin Express API
├── new sql/
│   └── sql_all.txt                 # Canonical DB schema
├── k8s/                            # Kubernetes manifests
├── docker-compose.production.yml
├── .env.production.example
├── PRODUCTION_DEPLOYMENT.md
└── docs/                           # This documentation
```

## Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture](architecture.md) | System design, dual-backend rationale, auth, MinIO, SEO |
| [Local Development](local-development.md) | Step-by-step local setup for all services |
| [Production Deployment](production-deployment.md) | Docker Compose and Kubernetes procedures |
| [Environment Variables](environment-variables.md) | Complete env var reference |
| [Database Schema](database-schema.md) | Tables, FKs, enums, indexes |
| [User Backend API](api-user-backend.md) | Customer API endpoints |
| [Admin Backend API](api-admin-backend.md) | Admin API endpoints |
| [Security Notes](security-notes.md) | Known vulnerabilities and recommendations |

## Default Ports

| Service | Port |
|---------|------|
| User frontend | 3000 |
| User backend | 3005 |
| Admin frontend | 3002 (mapped from container 3000) |
| Admin backend | 3001 |
| MySQL | 3306 |
| MinIO | 9000 |

## Health Endpoints

| Service | URL |
|---------|-----|
| User backend | `GET /health` → `{ ok, database }` |
| Admin backend | `GET /health` → `{ ok, service }` |

## Key Design Decisions

1. **Dual backends** — Customer and admin APIs are separate Express apps with different auth models and responsibilities.
2. **Client-side cart** — Cart state lives in `localStorage`; server `cart` table exists but checkout clears it after order placement.
3. **Shared database** — Both backends connect to the same `ecommerce` MySQL database.
4. **MinIO for images** — Product photos upload via admin backend to MinIO bucket `products`.
5. **Next.js standalone** — Both frontends use `output: 'standalone'` for Docker/K8s images.

See [Architecture](architecture.md) for full detail.

## User-Facing Documentation

- [Customer Shopping Guide](../user-guide/customer-shopping-guide.md)
- [Admin Panel Guide](../user-guide/admin-panel-guide.md)

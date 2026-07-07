# WEBSITE_2026 Documentation

This repository is a full ecommerce system with two Next.js frontends, two Express backends, MySQL, and MinIO.

Use these documents first:

| Document | Purpose |
| --- | --- |
| [Docker Compose Guide](docker-compose.md) | How the full stack runs with one `docker compose up -d --build` command |
| [AI Project Context](ai-project-context.md) | Full project map for another AI or developer to understand the system quickly |
| [User Frontend](services/user-frontend.md) | Customer storefront app, URLs, env, routes, Docker behavior |
| [User Backend](services/user-backend.md) | Customer API, checkout, products, reviews, SEO slug endpoints |
| [Admin Frontend](services/admin-frontend.md) | Admin panel app, env, modules, upload settings |
| [Admin Backend](services/admin-backend.md) | Admin API, database writes, MinIO upload, settings modules |

Older detailed references are still available under [technical](technical/README.md) and [user-guide](user-guide/README.md).

## Apps And Ports

| Service | Path | Default host port | Container port |
| --- | --- | ---: | ---: |
| User frontend | `user/ecommerce_frontend_2026` | `3000` | `3000` |
| User backend | `user/ecommerce_backend_2026` | `3005` | `3005` |
| Admin frontend | `admin/admin_panel_frontend` | `3002` | `3000` |
| Admin backend | `admin/admin_panel_backend` | `3001` | `3001` |
| MySQL | `mysql:8.0` | `3306` | `3306` |
| MinIO API | `minio/minio` | `9000` | `9000` |
| MinIO console | `minio/minio` | `9001` | `9001` |

## Fast Start

From the repository root:

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

Default URLs when `.env` has `APP_HOST=192.168.1.99`:

| Area | URL |
| --- | --- |
| Customer site | `http://192.168.1.99:3000` |
| Customer API | `http://192.168.1.99:3005` |
| Admin panel | `http://192.168.1.99:3002` |
| Admin API | `http://192.168.1.99:3001` |
| MinIO console | `http://192.168.1.99:9001` |

If your machine IP is different, change `APP_HOST` in `.env` before building the frontends.

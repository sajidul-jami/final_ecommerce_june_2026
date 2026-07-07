# Technical Documentation

This folder keeps deeper technical references. For current day-to-day work, start with the newer focused docs:

- [Docker Compose Guide](../docker-compose.md)
- [AI Project Context](../ai-project-context.md)
- [User Frontend](../services/user-frontend.md)
- [User Backend](../services/user-backend.md)
- [Admin Frontend](../services/admin-frontend.md)
- [Admin Backend](../services/admin-backend.md)

## Existing References

| Document | Purpose |
| --- | --- |
| [Architecture](architecture.md) | Broader architecture notes |
| [Local Development](local-development.md) | Manual local development notes |
| [Production Deployment](production-deployment.md) | Deployment notes |
| [Environment Variables](environment-variables.md) | Environment variable reference |
| [Database Schema](database-schema.md) | Database table notes |
| [User Backend API](api-user-backend.md) | User API endpoint reference |
| [Admin Backend API](api-admin-backend.md) | Admin API endpoint reference |
| [Security Notes](security-notes.md) | Security and hardening notes |

## Current Runtime Summary

| Service | Path | Port |
| --- | --- | ---: |
| User frontend | `user/ecommerce_frontend_2026` | `3000` |
| User backend | `user/ecommerce_backend_2026` | `3005` |
| Admin frontend | `admin/admin_panel_frontend` | `3002` host, `3000` container |
| Admin backend | `admin/admin_panel_backend` | `3001` |
| MySQL | Docker service `mysql` | `3306` |
| MinIO API | Docker service `minio` | `9000` |
| MinIO console | Docker service `minio` | `9001` |

## Current SQL Locations

| Location | Use |
| --- | --- |
| `mysql-container/initdb` | Fresh Docker MySQL initialization |
| `sql scema` | Copy-paste migrations for existing databases |

## Current Docker Entry

Use the root compose file:

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

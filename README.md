# WEBSITE_2026 Ecommerce

Full-stack ecommerce project with:

- Customer storefront: `user/ecommerce_frontend_2026`
- Customer API: `user/ecommerce_backend_2026`
- Admin panel: `admin/admin_panel_frontend`
- Admin API: `admin/admin_panel_backend`
- MySQL database
- MinIO image storage

## Quick Docker Run

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

Default URLs with `APP_HOST=192.168.1.99`:

- User site: `http://192.168.1.99:3000`
- User API: `http://192.168.1.99:3005`
- Admin panel: `http://192.168.1.99:3002`
- Admin API: `http://192.168.1.99:3001`
- MinIO console: `http://192.168.1.99:9001`

## Documentation

Start here:

- [Docs Index](docs/README.md)
- [Docker Compose Guide](docs/docker-compose.md)
- [AI Project Context](docs/ai-project-context.md)
- [User Frontend](docs/services/user-frontend.md)
- [User Backend](docs/services/user-backend.md)
- [Admin Frontend](docs/services/admin-frontend.md)
- [Admin Backend](docs/services/admin-backend.md)

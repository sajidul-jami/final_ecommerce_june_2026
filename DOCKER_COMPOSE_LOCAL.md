# Docker Compose Local

The full Docker guide now lives in [docs/docker-compose.md](docs/docker-compose.md).

Fast run:

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

Useful commands:

```powershell
docker compose ps
docker compose logs -f user-backend
docker compose logs -f admin-backend
docker compose down
```

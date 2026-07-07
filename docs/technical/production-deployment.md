# Production Deployment

This project currently has two deployment styles:

- Docker Compose full stack from the repository root.
- Kubernetes manifests under `k8s/` for more advanced deployments.

For quick server deployment, use the root [docker-compose.yml](../../docker-compose.yml).

## Docker Compose Deployment

1. Copy env template:

```powershell
Copy-Item .env.docker.example .env
```

2. Edit `.env`:

```env
APP_HOST=your-server-ip-or-domain
MYSQL_ROOT_PASSWORD=change_this
MINIO_ACCESS_KEY=change_this
MINIO_SECRET_KEY=change_this
USER_JWT_SECRET=change_this
ADMIN_JWT_SECRET=change_this
```

3. Build and start:

```powershell
docker compose up -d --build
```

4. Check:

```powershell
docker compose ps
docker compose logs -f user-backend
docker compose logs -f admin-backend
```

## Public URLs

Set `APP_HOST` to the host that browsers will use.

For a server IP:

```env
APP_HOST=192.168.1.99
```

For a domain:

```env
APP_HOST=shop.example.com
```

The current compose file uses HTTP. If using HTTPS behind a reverse proxy, update public frontend build args or proxy routes accordingly.

## Data Persistence

Docker volumes:

| Volume | Stores |
| --- | --- |
| `website2026_mysql_data` | MySQL database |
| `website2026_minio_data` | MinIO uploaded files |

Back up both volumes before server migration or destructive maintenance.

## SQL Updates

Fresh Docker installs load SQL from:

```text
mysql-container/initdb
```

Existing production databases must run SQL migrations manually from:

```text
sql scema
```

Do not rely on MySQL init scripts for an existing volume.

## Kubernetes

Kubernetes manifests live in:

```text
k8s/
```

Before Kubernetes deployment, review:

- API public URLs and CORS origins.
- Secret values for MySQL, JWT, and MinIO.
- MinIO bucket creation.
- Frontend rebuild with final `NEXT_PUBLIC_*` values.

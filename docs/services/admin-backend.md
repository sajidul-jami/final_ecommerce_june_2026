# Admin Backend

Path: `admin/admin_panel_backend`

The admin backend is the private management API. It writes product, brand, order, customer, content, and site settings data to MySQL and uploads media to MinIO.

## Runtime

| Item | Value |
| --- | --- |
| Framework | Express 5 |
| Local/Docker port | `3001` |
| Entry file | `script.js` |
| Dockerfile | `admin/admin_panel_backend/Dockerfile` |
| Health endpoint | `GET /health` |

## Important Env

| Variable | Meaning |
| --- | --- |
| `PORT` | API port, default `3001` |
| `JWT_SECRET` | Admin JWT signing secret |
| `CLIENT_URL` | Admin frontend origin |
| `ADMIN_CLIENT_URL` | Admin frontend origin |
| `CORS_ORIGINS` | Optional comma-separated allowed origins |
| `DB_HOST` | MySQL host, `mysql` in Docker |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | MySQL port |
| `MINIO_ENDPOINT` | MinIO host, `minio` in Docker |
| `MINIO_PORT` | MinIO port |
| `MINIO_USE_SSL` | `false` for local Docker |
| `MINIO_ACCESS_KEY` | MinIO access key |
| `MINIO_SECRET_KEY` | MinIO secret key |
| `MINIO_PUBLIC_URL` | Browser-reachable MinIO URL |
| `MINIO_BUCKET` | Bucket name, usually `ecommerce` |

## Responsibilities

- Admin authentication and protected admin routes.
- Product create/update including brand, country of origin, slug generation, images, status.
- Brand create/update including image, description, status, SEO fields, slug generation.
- Site settings management including dynamic SEO, footer, contact, tracking, and delivery charges.
- Customer and guest customer visibility for admin.
- Order list/detail with delivery zone and delivery charge.
- Upload route that stores files in MinIO.

## Upload Contract

The upload route uses MinIO:

```text
Admin frontend -> admin backend /upload -> MinIO bucket -> public URL
```

The browser must be able to load returned images through:

```text
${MINIO_PUBLIC_URL}/${MINIO_BUCKET}/{objectKey}
```

For local Docker, that is normally:

```text
http://192.168.1.99:9000/ecommerce/{objectKey}
```

## Local Commands

```powershell
cd admin/admin_panel_backend
npm install
npm start
node --check script.js
```

## Docker

The root compose file builds this service as `website2026/admin-backend:local`.

```powershell
docker compose up -d --build admin-backend
docker compose logs -f admin-backend
```

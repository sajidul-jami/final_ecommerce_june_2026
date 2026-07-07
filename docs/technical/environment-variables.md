# Environment Variables

This page lists the current important environment variables.

## Root Docker Compose `.env`

Created from `.env.docker.example`.

| Variable | Default/example | Purpose |
| --- | --- | --- |
| `APP_HOST` | `192.168.1.99` | Public host used in frontend build URLs |
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root password |
| `MYSQL_PORT` | `3306` | Host MySQL port |
| `DB_NAME` | `ecommerce` | Database name |
| `MINIO_ACCESS_KEY` | `admin` | MinIO user |
| `MINIO_SECRET_KEY` | `password123` | MinIO password |
| `MINIO_BUCKET` | `ecommerce` | Bucket for uploaded assets |
| `MINIO_PORT` | `9000` | MinIO API host port |
| `MINIO_CONSOLE_PORT` | `9001` | MinIO console host port |
| `USER_FRONTEND_PORT` | `3000` | Customer frontend host port |
| `USER_BACKEND_PORT` | `3005` | Customer API host port |
| `ADMIN_FRONTEND_PORT` | `3002` | Admin frontend host port |
| `ADMIN_BACKEND_PORT` | `3001` | Admin API host port |
| `USER_JWT_SECRET` | change value | Customer JWT secret |
| `ADMIN_JWT_SECRET` | change value | Admin JWT secret |

## User Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Public user backend URL |
| `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | Public MinIO bucket URL |
| `NEXT_PUBLIC_SITE_URL` | Public storefront URL |

Docker example:

```text
NEXT_PUBLIC_API_BASE_URL=http://${APP_HOST}:${USER_BACKEND_PORT}
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://${APP_HOST}:${MINIO_PORT}/${MINIO_BUCKET}
NEXT_PUBLIC_SITE_URL=http://${APP_HOST}:${USER_FRONTEND_PORT}
```

## User Backend

| Variable | Purpose |
| --- | --- |
| `PORT` | API port |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | MySQL port |
| `JWT_SECRET` | Customer auth JWT secret |
| `CLIENT_URL` | Storefront origin |
| `CORS_ORIGINS` | Optional allowed origins |

## Admin Frontend

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Admin backend API URL with `/api` |
| `NEXT_PUBLIC_UPLOAD_URL` | Admin backend upload URL |
| `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | Public MinIO bucket URL |

Docker example:

```text
NEXT_PUBLIC_API_URL=http://${APP_HOST}:${ADMIN_BACKEND_PORT}/api
NEXT_PUBLIC_UPLOAD_URL=http://${APP_HOST}:${ADMIN_BACKEND_PORT}/upload
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://${APP_HOST}:${MINIO_PORT}/${MINIO_BUCKET}
```

## Admin Backend

| Variable | Purpose |
| --- | --- |
| `PORT` | API port |
| `JWT_SECRET` | Admin JWT secret |
| `CLIENT_URL` | Admin frontend origin |
| `ADMIN_CLIENT_URL` | Admin frontend origin |
| `CORS_ORIGINS` | Optional allowed origins |
| `DB_HOST` | MySQL host |
| `DB_USER` | MySQL user |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name |
| `DB_PORT` | MySQL port |
| `MINIO_ENDPOINT` | Internal MinIO host |
| `MINIO_PORT` | Internal MinIO port |
| `MINIO_USE_SSL` | SSL setting |
| `MINIO_ACCESS_KEY` | MinIO user |
| `MINIO_SECRET_KEY` | MinIO password |
| `MINIO_PUBLIC_URL` | Browser reachable MinIO base |
| `MINIO_BUCKET` | Bucket name |

## Important Rule

All `NEXT_PUBLIC_*` variables are build-time values for Next.js. Rebuild frontend images after changing them.

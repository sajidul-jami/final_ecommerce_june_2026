# Local Development

For the fastest local setup, use Docker Compose from the repository root.

```powershell
Copy-Item .env.docker.example .env
docker compose up -d --build
```

Full details: [Docker Compose Guide](../docker-compose.md).

## Manual Local Development

Use manual mode only when you want to run Node apps directly on the host.

You still need MySQL and MinIO running. The easiest way is to start only those services:

```powershell
docker compose up -d mysql minio minio-init
```

Then run each app in a separate terminal.

## User Backend

Path: `user/ecommerce_backend_2026`

```powershell
cd user/ecommerce_backend_2026
npm install
npm start
```

Required `.env` values:

```env
PORT=3005
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=ecommerce
DB_PORT=3306
JWT_SECRET=local_user_jwt_secret_change_me
CLIENT_URL=http://localhost:3000
```

Health check: `http://localhost:3005/health`

## User Frontend

Path: `user/ecommerce_frontend_2026`

```powershell
cd user/ecommerce_frontend_2026
npm install
npm run dev
```

Required `.env.local` values:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://localhost:9000/ecommerce
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Admin Backend

Path: `admin/admin_panel_backend`

```powershell
cd admin/admin_panel_backend
npm install
npm start
```

Required `.env` values:

```env
PORT=3001
JWT_SECRET=local_admin_jwt_secret_change_me
CLIENT_URL=http://localhost:3002
ADMIN_CLIENT_URL=http://localhost:3002
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=rootpassword
DB_NAME=ecommerce
DB_PORT=3306
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_BUCKET=ecommerce
```

Health check: `http://localhost:3001/health`

## Admin Frontend

Path: `admin/admin_panel_frontend`

```powershell
cd admin/admin_panel_frontend
npm install
npm run dev -- -p 3002
```

Required `.env.local` values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3001/upload
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://localhost:9000/ecommerce
```

## SQL

Fresh Docker MySQL loads:

```text
mysql-container/initdb
```

Existing databases should use copy-paste migrations from:

```text
sql scema
```

## Verification

```powershell
cd user/ecommerce_frontend_2026
npm run lint
npm run build

cd admin/admin_panel_frontend
npm run lint
npm run build

cd user/ecommerce_backend_2026
node --check index.js

cd admin/admin_panel_backend
node --check script.js
```

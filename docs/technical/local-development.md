# Local Development

Step-by-step guide to run all **TechTrends BD** services on your development machine.

## Prerequisites

| Requirement | Version / notes |
|-------------|-----------------|
| Node.js | 18 or later |
| npm | Bundled with Node |
| MySQL | 8.x |
| MinIO | For product image uploads (admin panel) |
| Git | To clone the repository |

Optional: Docker Desktop if you prefer the Compose stack instead of native services.

---

## 1. Clone and Open the Repository

```powershell
cd D:\WEBSITE_2026
```

---

## 2. MySQL Setup

### Create the database

Import the canonical schema:

```powershell
mysql -u root -p < "new sql/sql_all.txt"
```

This creates database `ecommerce` with all tables, delivery columns, and indexes.

**Docker Compose init path:** `new sql/sql_all.txt` (mounted into MySQL on first boot)

### Create an admin user

The admin panel requires at least one row in `admins`. Example (password will be hashed if created via admin API register; for manual insert use bcrypt or register via API):

```sql
USE ecommerce;
INSERT INTO admins (full_name, email, password, role, status)
VALUES ('Store Admin', 'admin@techtrends.local', '$2a$10$...bcrypt_hash...', 'Super Admin', 'Active');
```

Easiest approach: start the admin backend and call `POST /api/auth/register` once, then use that account to log in.

### Verify connection

```powershell
mysql -u root -p -e "USE ecommerce; SHOW TABLES;"
```

Expected tables include: `admins`, `users`, `category`, `products`, `orders`, `details`, `payments`, `cart`, `user_addresses`, `product_reviews`, `support_tickets`, `product_images`.

---

## 3. MinIO Setup

MinIO stores product images uploaded from the admin panel.

### Run MinIO locally

```powershell
# Example using Docker
docker run -d -p 9000:9000 -p 9001:9001 `
  -e MINIO_ROOT_USER=admin `
  -e MINIO_ROOT_PASSWORD=password123 `
  minio/minio server /data --console-address ":9001"
```

### Create bucket

1. Open MinIO Console: http://localhost:9001
2. Log in with `admin` / `password123`
3. Create bucket named **`products`**
4. Set bucket policy to allow public read (or use a CDN in front)

Uploaded images are stored at `products/images/productsimg/{filename}`.

---

## 4. Environment Configuration

Copy each template to `.env`:

```powershell
Copy-Item user/ecommerce_backend_2026/.env.example user/ecommerce_backend_2026/.env
Copy-Item user/ecommerce_frontend_2026/.env.example user/ecommerce_frontend_2026/.env
Copy-Item admin/admin_panel_backend/.env.example admin/admin_panel_backend/.env
Copy-Item admin/admin_panel_frontend/.env.example admin/admin_panel_frontend/.env
```

### User backend (`user/ecommerce_backend_2026/.env`)

```env
PORT=3005
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce
DB_PORT=3306
JWT_SECRET=change_me_to_a_long_random_secret
CLIENT_URL=http://localhost:3000
CORS_ORIGINS=
```

### User frontend (`user/ecommerce_frontend_2026/.env`)

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://localhost:9000/products/images/productsimg
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Admin backend (`admin/admin_panel_backend/.env`)

```env
PORT=3001
JWT_SECRET=change_me_to_a_long_random_secret
CLIENT_URL=http://localhost:3000,http://localhost:3002,http://127.0.0.1:3000
ADMIN_CLIENT_URL=http://localhost:3002
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=ecommerce
DB_PORT=3306
MINIO_ENDPOINT=127.0.0.1
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY=admin
MINIO_SECRET_KEY=password123
MINIO_PUBLIC_URL=http://localhost:9000
```

### Admin frontend (`admin/admin_panel_frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_UPLOAD_URL=http://localhost:3001/upload
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://localhost:9000/products/images/productsimg
```

See [Environment Variables](environment-variables.md) for the full reference.

---

## 5. Install Dependencies

Run in each app directory:

```powershell
cd user/ecommerce_backend_2026 && npm install
cd ../../user/ecommerce_frontend_2026 && npm install
cd ../../admin/admin_panel_backend && npm install
cd ../admin_panel_frontend && npm install
```

---

## 6. Start All Four Applications

Use **four separate terminals**:

### Terminal 1 — User backend

```powershell
cd D:\WEBSITE_2026\user\ecommerce_backend_2026
npm start
```

Expected: `Ecommerce API listening on http://0.0.0.0:3005`

### Terminal 2 — User frontend

```powershell
cd D:\WEBSITE_2026\user\ecommerce_frontend_2026
npm run dev
```

Expected: Next.js on http://localhost:3000

### Terminal 3 — Admin backend

```powershell
cd D:\WEBSITE_2026\admin\admin_panel_backend
npm start
```

Expected: `Server running on http://0.0.0.0:3001`

### Terminal 4 — Admin frontend

```powershell
cd D:\WEBSITE_2026\admin\admin_panel_frontend
npm run dev -- -p 3002
```

Expected: Next.js on http://localhost:3002

---

## 7. Verify the Stack

| Check | URL / command |
|-------|---------------|
| User API health | http://localhost:3005/health |
| Admin API health | http://localhost:3001/health |
| Storefront | http://localhost:3000 |
| Admin login | http://localhost:3002/login |
| Categories API | http://localhost:3005/categories |
| Products API | http://localhost:3005/products |

### Sample health responses

User backend:

```json
{ "ok": true, "database": "connected" }
```

Admin backend:

```json
{ "ok": true, "service": "admin-backend" }
```

---

## 8. LAN / Mobile Testing

When testing from a phone or another machine on the same network, **do not use `localhost`** in frontend env vars. Use your machine's LAN IP consistently:

```env
# admin/admin_panel_frontend/.env
NEXT_PUBLIC_API_URL=http://192.168.1.99:3001/api
NEXT_PUBLIC_UPLOAD_URL=http://192.168.1.99:3001/upload
NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://192.168.1.99:9000/products/images/productsimg
```

Also add the LAN origin to admin backend `CLIENT_URL` / `ADMIN_CLIENT_URL`.

Restart Next.js dev servers after changing `NEXT_PUBLIC_*` variables.

---

## 9. Alternative: Docker Compose

To run MySQL, MinIO, and all 4 apps in containers:

```powershell
cd D:\WEBSITE_2026
Copy-Item .env.production.example .env
# Edit .env with real secrets

docker compose -f docker-compose.production.yml --env-file .env build
docker compose -f docker-compose.production.yml --env-file .env up -d
```

See [Production Deployment](production-deployment.md) for details.

Fresh database reset (destroys MySQL volume):

```powershell
docker compose -f docker-compose.production.yml down -v
```

---

## 10. Pre-Commit Verification

```powershell
cd user/ecommerce_frontend_2026
npm run lint && npm run build

cd ../../admin/admin_panel_frontend
npm run lint && npm run build

cd ../../user/ecommerce_backend_2026
node --check index.js

cd ../../admin/admin_panel_backend
node --check script.js
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `Missing required environment variable(s)` | Set `DB_HOST`, `DB_USER`, `DB_NAME`, `JWT_SECRET` in user backend `.env` |
| MySQL connection refused | Ensure MySQL is running; check `DB_HOST` / `DB_PORT` |
| Admin CORS blocked | Add frontend origin to `CLIENT_URL` in admin backend |
| Images 404 | Create MinIO bucket `products`; check `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` |
| Admin login cookie not sent | Use same-site compatible URLs; enable `credentials: 'include'` in fetch |
| Port already in use | Change `PORT` or stop conflicting process |

---

## Next Steps

- [API User Backend](api-user-backend.md) — endpoint reference
- [API Admin Backend](api-admin-backend.md) — endpoint reference
- [Production Deployment](production-deployment.md) — go live

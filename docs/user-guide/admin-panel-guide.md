# Admin Panel Guide

This guide explains how to operate **TechTrends BD** using the admin panel (ShopAdmin).

## Access

| Setting | Value (local) |
|---------|---------------|
| Admin panel URL | http://localhost:3002 |
| Admin API URL | http://localhost:3001 |
| Login page | http://localhost:3002/login |

You need an account in the `admins` database table. At least one admin must be created manually in MySQL before first use (see [Database Schema](../technical/database-schema.md)).

---

## Logging In

1. Open the admin panel URL.
2. Enter your **email** and **password**.
3. Click **Login**.

On success:

- A JWT is stored in an **httpOnly cookie** (`token`) on the admin API domain
- You are redirected to the dashboard
- The session lasts **7 days**

### Logging Out

Click **Logout** in the sidebar footer. This clears the auth cookie via `POST /api/auth/logout`.

---

## Navigation

The sidebar provides access to all admin sections:

| Menu item | Path | Purpose |
|-----------|------|---------|
| Dashboard | `/admin/dashboard` | Overview metrics and recent activity |
| Orders | `/admin/orders` | View and manage customer orders |
| Products | `/admin/products` | Add, edit, delete products |
| Categories | `/admin/categories` | Manage product categories |
| Customers | `/admin/users` | View registered customers |
| Sales | `/admin/sales` | Revenue and payment analytics |
| Admin Users | `/admin/admin_users` | Manage administrator accounts |

---

## Dashboard

**Path:** `/admin/dashboard`

The dashboard displays at-a-glance metrics:

| Metric | Source |
|--------|--------|
| Total revenue | Sales summary API |
| Order count | All orders |
| Product count | All products |
| Low stock alerts | Products with stock ≤ 10 |

Additional panels:

- **Recent sales** — latest completed transactions
- **Top products** — highest-priced products (sample ranking)
- **Order status breakdown** — Pending, Processing, Completed, Cancelled

If data fails to load, verify the admin backend is running and you are logged in (cookie present).

---

## Orders

**Path:** `/admin/orders`

### Order list

View all orders with customer name, total amount, payment method, order status, and date.

### Order detail

**Path:** `/admin/orders/[id]`

View a single order including:

- Customer contact information
- Delivery details
- Line items (product name, quantity, price)
- Payment method and status

### Update order status

Change status to one of:

| Status | Meaning |
|--------|---------|
| Pending | New order, not yet processed |
| Processing | Being prepared or shipped |
| Completed | Fulfilled |
| Cancelled | Order cancelled |

Use the status update control on the order detail page (calls `PATCH /api/orders/:id/status`).

### Create order (manual)

**Path:** `/admin/orders/create`

Manually create an order for phone/walk-in sales. Useful for orders placed outside the website.

### Delete order

Orders can be deleted from the admin API (`DELETE /api/orders/:id`). Use with caution — this removes the order record.

---

## Products

**Path:** `/admin/products`

### View products

The products table shows all products from the database including name, SKU, price, stock (`quantity`), category, and photo.

### Add product

1. Click **Add Product**.
2. Fill in required fields:
   - **Category** — select from existing categories
   - **Name**
   - **Price**
3. Optional fields:
   - SKU
   - Stock quantity
   - Description
   - Product photo (upload via MinIO)
4. Save.

Product images are uploaded to MinIO at path `products/images/productsimg/` via `POST /upload`.

### Edit product

Select a product and update any field. Image URL is stored in the `photo` column.

### Delete product

Removes the product from the database. Ensure no active orders depend on the product before deleting.

### Image upload

Images upload to the admin backend upload endpoint (`NEXT_PUBLIC_UPLOAD_URL`, default `http://localhost:3001/upload`). The returned URL should be saved as the product `photo` field.

**MinIO bucket:** `products`  
**Object path pattern:** `images/productsimg/{filename}`

---

## Categories

**Path:** `/admin/categories`

Categories use a **hierarchical code system**:

| Level | `cat_code` example | `parent_code` |
|-------|-------------------|---------------|
| Main | `000` | none |
| Sub | `000-001` | `000` |
| Sub-sub | `000-001-002` | `000-001` |

### Add category

Required fields:

- **Name** — display name
- **cat_slug** — URL-friendly slug
- **cat_code** — unique hierarchical code
- **parent_code** — required for sub and sub-sub categories

Validation rules enforced by the API:

- Main categories (1 segment) cannot have `parent_code`
- Sub and sub-sub categories must have `parent_code`
- Parent category must exist in the database

### Edit / delete

Update name, slug, or codes. Deleting a category may fail if products still reference it (foreign key on `products.category_id`).

---

## Customers

**Path:** `/admin/users`

View all registered customers (`users` table) with:

- User name and full name
- Email and phone number
- Address and city
- Account status
- Registration date

This view is **read-only** in the current admin panel — customer records are created via the storefront signup flow.

---

## Sales

**Path:** `/admin/sales`

Analytics powered by the sales API:

| Report | Endpoint | Description |
|--------|----------|-------------|
| Total sales | `/api/sales/summary` | Sum of all order amounts |
| Recent sales | `/api/sales/recent` | Latest sales transactions |
| Payment breakdown | `/api/sales/payment-method` | Orders grouped by payment method |

Use this page to understand revenue trends and which payment methods customers prefer (COD vs bKash vs Nagad vs Card).

---

## Admin Users

**Path:** `/admin/admin_users`

Manage administrator accounts in the `admins` table.

### Roles

| Role | Description |
|------|-------------|
| Super Admin | Full access (convention) |
| Manager | Default role for new admins |
| Support | Support staff (convention) |

### Create admin

Register a new admin with:

- Full name
- Email (unique)
- Password (stored hashed with bcrypt on the admin backend)
- Role
- Phone (optional)

### Edit admin

Update name, role, phone, or status (Active / Inactive).

### Delete admin

Remove an admin account. Ensure at least one active admin remains.

**Security note:** Admin user CRUD endpoints under `/api/auth/admins` are currently **not protected** by JWT middleware. Restrict network access to the admin API in production. See [Security Notes](../technical/security-notes.md).

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|--------------|-----|
| Login page loads but login fails | No admin in database or wrong password | Insert admin row in MySQL; verify email/password |
| "Unauthorized" on all pages | Cookie not sent or expired | Log in again; check CORS and `credentials: include` |
| CORS error in browser | Admin frontend URL not in `CLIENT_URL` | Add `http://localhost:3002` to admin backend `CLIENT_URL` |
| Product image upload fails | MinIO not running or wrong credentials | Start MinIO; verify `MINIO_*` env vars |
| Images show broken in panel | Wrong `NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL` | Match MinIO public URL + `/products/images/productsimg` |
| Dashboard shows $ instead of ৳ | Admin dashboard uses USD formatter | Cosmetic; data is correct |
| Cannot connect to API | Admin backend not running | Start `admin_panel_backend` on port 3001 |
| LAN/mobile testing fails | Using `localhost` in env | Use your machine's LAN IP in all `NEXT_PUBLIC_*` URLs |

### Health check

Verify the admin API is up:

```
GET http://localhost:3001/health
```

Expected response:

```json
{ "ok": true, "service": "admin-backend" }
```

### Pre-release verification

From the repository root:

```powershell
cd admin/admin_panel_frontend
npm run lint
npm run build

cd admin/admin_panel_backend
node --check script.js
```

For deployment procedures, see [Production Deployment](../technical/production-deployment.md).

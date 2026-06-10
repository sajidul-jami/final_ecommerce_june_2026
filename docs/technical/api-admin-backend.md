# Admin Backend API Reference

Administrative REST API served by `admin/admin_panel_backend/script.js`.

| Property | Value |
|----------|-------|
| Default base URL | `http://localhost:3001` |
| API prefix | `/api` |
| Framework | Express 5 |
| Auth | JWT in httpOnly cookie `token` (except public auth routes) |
| CORS | Whitelist via `CLIENT_URL` / `ADMIN_CLIENT_URL` |
| Credentials | Required (`credentials: 'include'`) |

---

## Health

### `GET /health`

**Auth:** None

**Response 200:**

```json
{ "ok": true, "service": "admin-backend" }
```

---

## Authentication (`/api/auth`)

### Public routes (no JWT)

Login and logout are public. Register is public only when the `admins` table is empty (first-admin bootstrap); otherwise it requires a logged-in **Super Admin** (JWT cookie).

Login and register are rate-limited (5 attempts per 15 minutes per IP).

### `POST /api/auth/login`

Admin login.

**Body:**

```json
{ "email": "admin@example.com", "password": "secret" }
```

**Response 200:**

```json
{
  "success": true,
  "message": "Login successful",
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "role": "Manager",
    "full_name": "Store Admin"
  }
}
```

Sets httpOnly cookie `token` (7-day expiry, `sameSite: lax`, `secure: true` in production).

**Errors:** `404` admin not found, `401` invalid password, `403` inactive account, `500`.

---

### `POST /api/auth/logout`

Clears the `token` cookie.

**Response 200:**

```json
{ "success": true, "message": "Logout successful" }
```

---

### `POST /api/auth/register`

Create a new admin (password bcrypt-hashed).

**Body:**

| Field | Required | Default |
|-------|----------|---------|
| `full_name` | Yes | |
| `email` | Yes | Unique |
| `password` | Yes | Hashed with bcrypt |
| `role` | No | `Manager` |
| `phone` | No | |

**Response 200:**

```json
{ "success": true, "message": "Admin created successfully", "adminId": 2 }
```

**Errors:** `409` email exists, `403` Super Admin required (when admins already exist), `500`.

---

### `GET /api/auth/me`

**Auth:** JWT required

Returns the currently logged-in admin (no password).

**Response 200:**

```json
{
  "success": true,
  "admin": {
    "id": 1,
    "email": "admin@example.com",
    "role": "Manager",
    "full_name": "Store Admin",
    "status": "Active"
  }
}
```

---

### `GET /api/auth/admins`

List all admins.

**Auth:** JWT + Super Admin

**Response 200:** Array of admin records (password never included).

---

### `PUT /api/auth/admins/:id`

Update an admin.

**Auth:** JWT + Super Admin

**Body:** Fields to update (`full_name`, `email`, `role`, `phone`, `status`, `password`, etc.). Password is bcrypt-hashed when provided; omit password to leave unchanged.

**Response 200:**

```json
{ "success": true, "message": "Admin updated successfully" }
```

---

### `DELETE /api/auth/admins/:id`

Delete an admin.

**Auth:** JWT + Super Admin

**Response 200:**

```json
{ "success": true, "message": "Admin deleted successfully" }
```

---

## Protected Routes

All routes below require valid JWT cookie (`verifyToken` middleware).

**401:** `{ "success": false, "message": "Unauthorized" }`  
**403:** `{ "success": false, "message": "Invalid token" }`

---

## Admin Test (`/api/admin`)

### `GET /api/admin/`

Smoke test for protected admin route.

**Response 200:**

```json
{ "success": true, "message": "Admin API Working" }
```

---

## Products (`/api/products`)

### `GET /api/products/`

List all products.

**Response 200:**

```json
{ "success": true, "data": [ { "id", "category_id", "name", "product_name", "sku", "price", "quantity", "stock", "description", "photo", ... } ] }
```

`product_name` and `stock` are aliases of `name` and `quantity` for dashboard compatibility.

---

### `GET /api/products/:id`

Get single product.

**Response 200:** `{ "success": true, "data": { ... } }`  
**Response 404:** `{ "success": false, "message": "Not found" }`

---

### `POST /api/products/add`

Create product.

**Body:**

| Field | Required |
|-------|----------|
| `category_id` | Yes |
| `name` | Yes |
| `price` | Yes |
| `sku`, `quantity`, `description`, `photo` | No |

**Response 200:**

```json
{ "success": true, "message": "Product Added", "id": 10 }
```

---

### `PUT /api/products/update/:id`

Update product. Same required fields as add.

**Response 200:**

```json
{ "success": true, "message": "Product Updated" }
```

---

### `DELETE /api/products/delete/:id`

Delete product.

**Response 200:**

```json
{ "success": true, "message": "Product Deleted" }
```

---

## Categories (`/api/categories`)

### `GET /api/categories/`

List categories ordered by `cat_code`.

**Response 200:**

```json
{ "success": true, "data": [ ... ] }
```

---

### `GET /api/categories/:id`

Get single category.

**Response 404:** `{ "success": false, "message": "Category not found" }`

---

### `POST /api/categories/add`

Create category with hierarchy validation.

**Body:**

| Field | Required |
|-------|----------|
| `name` | Yes |
| `cat_slug` | Yes |
| `cat_code` | Yes |
| `parent_code` | Required for sub/sub-sub |

**Response 200:**

```json
{ "success": true, "message": "Category added", "id": 5 }
```

**Errors:** `400` validation (parent rules, duplicate code).

---

### `PUT /api/categories/update/:id`

Update category.

**Response 200:** `{ "success": true, "message": "Category updated" }`

---

### `DELETE /api/categories/delete/:id`

Delete category.

**Response 200:** `{ "success": true, "message": "Category deleted" }`

**Errors:** `400` if FK constraint fails.

---

## Orders (`/api/orders`)

### `GET /api/orders/`

List all orders.

**Response 200:**

```json
{ "success": true, "total": 25, "data": [ ... ] }
```

---

### `GET /api/orders/:id`

Get order with nested items.

**Response 200:**

```json
{
  "success": true,
  "data": {
    "order_id": 1,
    "full_name": "...",
    "email": "...",
    "phone": "...",
    "address": "...",
    "total_amount": 5000,
    "payment_method": "Cash On Delivery",
    "order_status": "Pending",
    "created_at": "...",
    "items": [
      { "product_id": 3, "product_name": "...", "quantity": 1, "price": 5000 }
    ]
  }
}
```

---

### `POST /api/orders/`

Create order with line items (transactional; validates and decrements stock).

**Body:**

```json
{
  "customer_id": 1,
  "payment_method": "Cash On Delivery",
  "order_status": "Pending",
  "items": [
    { "product_id": 3, "quantity": 2 }
  ]
}
```

**Response 200:**

```json
{ "success": true, "order_id": 42, "total_amount": 5000 }
```

**Errors:** `400` missing fields, insufficient stock, invalid product.

---

### `PUT /api/orders/:id`

Update order header fields.

**Body:** `customer_id`, `total_amount`, `payment_method`, `order_status`

**Response 200:**

```json
{ "success": true, "message": "Order updated" }
```

---

### `PATCH /api/orders/:id/status`

Update order status.

**Body:**

```json
{ "order_status": "Processing" }
```

Allowed values: `Pending`, `Processing`, `Completed`, `Cancelled`.

**Response 200:**

```json
{ "success": true, "message": "Status updated" }
```

---

### `DELETE /api/orders/:id`

Delete order and related `details` / `payments` rows (transactional).

**Response 200:**

```json
{ "success": true, "message": "Order deleted" }
```

---

## Sales (`/api/sales`)

### `GET /api/sales/summary`

Total sales amount.

**Response 200:**

```json
{ "success": true, "total_sales": 125000 }
```

---

### `GET /api/sales/recent`

Recent sales list.

**Response 200:**

```json
{ "success": true, "total": 10, "data": [ ... ] }
```

---

### `GET /api/sales/payment-method`

Payment method breakdown analytics.

**Response 200:**

```json
{ "success": true, "data": [ { "payment_method": "Cash On Delivery", "count": 15, ... } ] }
```

---

## Customers (`/api/customers`)

### `GET /api/customers/`

List all customers (`users` table).

**Response 200:**

```json
{ "success": true, "total": 50, "data": [ ... ] }
```

Read-only — no create/update/delete endpoints.

---

## Upload (`/upload`)

### `POST /upload`

Upload product image to MinIO. **Auth:** JWT required (`verifyToken`).

**Content-Type:** `multipart/form-data`

**Field:** `photo` (single file, max 5 MB; JPEG/PNG/WebP/GIF only)

**Response 200:**

```json
{
  "success": true,
  "url": "http://localhost:9000/products/images/productsimg/1710000000000-a1b2c3d4.jpg",
  "fileName": "1710000000000-a1b2c3d4.jpg"
}
```

**MinIO:**

- Bucket: `products`
- Object key: `images/productsimg/{uniqueFilename}`

**Errors:** `400` no file or invalid type, `401` unauthorized, `500` upload failure.

---

## Profile Test Route

### `GET /profile/:profile_name`

Protected test route.

**Response:** Plain text greeting with client IP.

---

## Frontend Integration

Admin panel services call these endpoints with:

```javascript
fetch(`${NEXT_PUBLIC_API_URL}/...`, { credentials: 'include' })
```

| Frontend env | Maps to |
|--------------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api` |
| `NEXT_PUBLIC_UPLOAD_URL` | `http://localhost:3001/upload` |

---

## Related

- [User Backend API](api-user-backend.md)
- [Security Notes](security-notes.md)
- [Environment Variables](environment-variables.md)

# User Backend API Reference

Customer-facing REST API served by `user/ecommerce_backend_2026`.

| Property | Value |
|----------|-------|
| Entry point | `index.js` (loads env, mounts routes, starts server) |
| Default base URL | Set via `PORT` (default `3005`) |
| Framework | Express 4 |
| Content-Type | `application/json` |
| CORS | `CLIENT_URL` / `CORS_ORIGINS` (+ dev LAN bypass when `NODE_ENV` ≠ `production`) |
| Authentication | **None** on routes — user id passed in request body |
| Passwords | bcrypt on signup; login supports bcrypt + legacy plaintext upgrade |

### Code layout

```
user/ecommerce_backend_2026/
├── index.js
├── routes/          auth, product, order, category, address, review, support, checkout, health
├── sql/
│   ├── pool.js
│   └── models/      user, product, order, category, address, review, support
└── middleware/      cors, error_handler
```

All endpoint paths and request/response shapes are unchanged from the monolithic `index.js` version.

---

## Health

### `GET /health`

Check API and database connectivity.

**Response 200:**

```json
{ "ok": true, "database": "connected" }
```

**Response 500:**

```json
{ "ok": false, "error": "error message" }
```

---

## Authentication

### `POST /signup`

Register a new customer.

**Body:**

| Field | Required | Description |
|-------|----------|-------------|
| `phone_number` | Yes | Primary identifier |
| `password` | Yes | Hashed with bcrypt before storage |
| `user_name` | No | Display name |
| `full_name` | No | Full name |
| `email` | No | Auto-generated from phone if omitted |
| `location` | No | |
| `address` | No | |
| `city` | No | |

**Response 201:**

```json
{
  "message": "Signup successful",
  "userId": 1,
  "user": { "id": 1, "user_name": "...", "email": "...", ... }
}
```

**Errors:** `400` missing fields, `409` duplicate phone/email, `500` server error.

---

### `POST /login`

Customer login.

**Body:**

| Field | Required | Description |
|-------|----------|-------------|
| `phone_number` or `email` | Yes | Login identifier |
| `password` | Yes | Plaintext submitted; verified against bcrypt hash (legacy plaintext still accepted once, then upgraded) |

**Response 200:**

```json
{
  "message": "Login successful",
  "user": { "id", "user_name", "full_name", "email", "phone_number", ... }
}
```

**Errors:** `400`, `401` invalid credentials, `500`.

**Note:** No JWT or session token returned. Frontend stores user object in localStorage.

---

### `POST /admin-login`

Legacy admin login on user backend (not used by admin panel).

**Body:** `email` or `phone_number`, `password`

**Response 200:** `{ message, token, user }` — JWT signed with `JWT_SECRET`.

**Errors:** `400`, `401`, `500`.

Compares admin password **in plaintext** against `admins.password`.

---

### `POST /update-user`

Update customer profile.

**Body:**

| Field | Required |
|-------|----------|
| `id` | Yes |
| `phone_number` | Yes |
| `user_name` / `name` / `full_name` | No |
| `location`, `address`, `city`, `email` | No |

**Response 200:**

```json
{ "message": "User data updated successfully", "user": { ... } }
```

**Errors:** `400`, `404`, `500`.

**Security:** No auth — any caller with a user id can update that user.

---

## Addresses

### `GET /users/:userId/addresses`

List saved addresses for a user.

**Response 200:** Array of address objects.

```json
[
  {
    "id": 1,
    "user_id": 1,
    "label": "Home",
    "recipient_name": "...",
    "phone_number": "...",
    "address_line": "...",
    "city": "...",
    "area": "",
    "postal_code": "",
    "is_default": 1,
    "created_at": "..."
  }
]
```

Returns `[]` if `user_addresses` table missing.

---

### `POST /users/:userId/addresses`

Create or update an address.

**Body:**

| Field | Required | Default |
|-------|----------|---------|
| `recipient_name` | Yes | |
| `phone_number` | Yes | |
| `address_line` | Yes | |
| `city` | Yes | |
| `label` | No | `Home` |
| `area`, `postal_code` | No | |
| `is_default` | No | `false` |
| `id` | No | If set, updates existing address |

**Response 200/201:**

```json
{ "message": "Address saved", "addresses": [ ... ] }
```

---

### `DELETE /users/:userId/addresses/:addressId`

Delete an address.

**Response 200:** `{ "message": "Address deleted" }`

---

## Orders

### `GET /orders/:userId`

List orders for a customer with line items.

**Response 200:**

```json
[
  {
    "id": 1,
    "customer_id": 1,
    "total_amount": 1500,
    "payment_method": "Cash On Delivery",
    "order_status": "Pending",
    "payment_status": "Unpaid",
    "created_at": "...",
    "items": [
      {
        "product_id": 5,
        "name": "Product name",
        "photo": "image.jpg",
        "quantity": 2,
        "price": 750
      }
    ]
  }
]
```

---

### `POST /checkout`

Place an order (primary checkout endpoint).

**Body:**

| Field | Required | Description |
|-------|----------|-------------|
| `user_id` | Yes | Customer ID |
| `products` | Yes | Array of `{ id, quantity }` or `{ product_id, quantity }` |
| `payment_method` | No | Default `Cash On Delivery` |
| `delivery_address_id` | No | Saved address ID |
| `delivery_name` | No | Delivery snapshot |
| `delivery_phone` | No | |
| `delivery_address` | No | |
| `delivery_city` | No | |

**Behavior:**

- Starts DB transaction with `FOR UPDATE` stock lock
- Validates stock per item
- Creates `orders`, `details`, `payments` rows
- Decrements `products.quantity`
- Deletes `cart` rows for user
- COD → `payment_status: Unpaid`; other methods → `Paid`

**Response 201:**

```json
{
  "message": "Order placed successfully",
  "orderId": 42,
  "totalAmount": 5000,
  "order_status": "Pending"
}
```

**Errors:** `400`, `500` with stock/product error messages.

---

### `POST /sales`

Backward-compatible alias for checkout. Maps `product_id` + `quantity` to products array.

---

## Catalog

### `GET /categories`

List all categories ordered by `cat_code`, `name`.

**Response 200:** Array of category objects.

---

### `GET /products`

List active products with optional filters.

**Query parameters:**

| Param | Description |
|-------|-------------|
| `category` | Filter by category id, slug, or code |
| `search` | Search name, description, SKU, category |
| `limit` | Max results (capped at 60) |
| `sort` | `newest` (default), `best_selling`, `price_asc`, `price_desc`, `name_asc` |

**Response 200:** Array of product objects with:

- `category_name`, `sold_count`
- `avg_rating`, `review_count` (from approved reviews)
- `images` array (from `product_images`)
- Normalized numeric `price`, `quantity`, `sold_count`

---

### `GET /singleproducts/:id`

Get single product by ID.

**Query:** `view=0` skips view counter increment.

**Response 200:** Product object (same shape as list item).

**Response 404:** `{ "error": "Product not found" }`

Increments `products.counter` on view (unless `view=0`).

---

## Reviews

### `GET /products/:productId/reviews`

List approved reviews for a product.

**Response 200:**

```json
[
  {
    "id": 1,
    "product_id": 5,
    "user_id": 2,
    "rating": 5,
    "title": "Great",
    "comment": "...",
    "created_at": "...",
    "reviewer_name": "Customer Name"
  }
]
```

---

### `POST /products/:productId/reviews`

Submit a product review.

**Body:**

| Field | Required |
|-------|----------|
| `user_id` | Yes |
| `rating` | Yes (1–5) |
| `comment` | Yes |
| `title` | No |

Reviews created with status `Approved` immediately.

**Response 201:** `{ "message": "Review submitted" }`

---

## Support

### `POST /support-tickets`

Create a support ticket.

**Body:**

| Field | Required |
|-------|----------|
| `name` | Yes |
| `phone_number` | Yes |
| `subject` | Yes |
| `message` | Yes |
| `user_id` | No |
| `email` | No |

**Response 201:** `{ "message": "Support request submitted" }`

---

## Admin / Legacy

### `POST /productadd`

Add a product (unauthenticated).

**Body:**

| Field | Required |
|-------|----------|
| `category_id` | Yes |
| `name` | Yes |
| `price` | Yes |
| `description`, `slug`, `photo`, `counter`, `quantity`, `sku`, `status` | No |
| `images` | No | Array of URLs or `{ image_url, alt_text }` |

**Response 201:** `{ "message": "Product inserted successfully", "productId": 1 }`

**Security:** No authentication required — restrict in production.

---

## Error Format

Most errors return:

```json
{ "error": "Human-readable message" }
```

Admin-login and some endpoints use `{ "message": "..." }` instead.

---

## Public User Fields

User objects never include `password`. Exposed fields:

```
id, user_name, full_name, email, phone_number, location, address, city, photo, type, status, created_at
```

---

## Related

- [Admin Backend API](api-admin-backend.md)
- [Security Notes](security-notes.md)
- [Database Schema](database-schema.md)

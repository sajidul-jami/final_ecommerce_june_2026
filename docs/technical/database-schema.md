# Database Schema

Reference for the **ecommerce** MySQL database used by TechTrends BD.

**Canonical schema file:** `new sql/sql_all.txt`  
**Docker init copy:** `user/ecommerce_backend_2026/new sql/sql_all.txt`

```sql
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;
```

---

## Entity Relationship Overview

```
admins (standalone)

users ──┬── user_addresses
        ├── cart ── products
        ├── orders ──┬── details ── products
        │            └── payments
        ├── product_reviews ── products
        └── support_tickets

category ── products ── product_images
```

---

## Tables

### `admins`

Administrator accounts for the admin panel.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Admin ID |
| `full_name` | VARCHAR(100) | NOT NULL | Display name |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Login email |
| `password` | VARCHAR(255) | NOT NULL | bcrypt hash (via admin API) |
| `role` | ENUM | DEFAULT `'Manager'` | `Super Admin`, `Manager`, `Support` |
| `phone` | VARCHAR(20) | | Contact phone |
| `status` | ENUM | DEFAULT `'Active'` | `Active`, `Inactive` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### `users`

Customer accounts for the storefront.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | User ID |
| `user_name` | TEXT | NOT NULL | Username / display |
| `email` | VARCHAR(200) | UNIQUE, NOT NULL | Email |
| `password` | VARCHAR(60) | NOT NULL | **Plaintext** (see security notes) |
| `type` | INT(1) | DEFAULT 0 | User type flag |
| `location` | TEXT | | Legacy location field |
| `phone_number` | VARCHAR(100) | | Primary login identifier |
| `photo` | VARCHAR(200) | DEFAULT `'default.jpg'` | Profile photo |
| `status` | INT(1) | DEFAULT 1 | 1 = active |
| `activate_code` | VARCHAR(15) | | Activation code |
| `reset_code` | VARCHAR(15) | | Password reset code |
| `created_at` | DATE | | Registration date |
| `full_name` | VARCHAR(100) | | Full name |
| `address` | TEXT | | Default address |
| `city` | VARCHAR(50) | | City |

---

### `category`

Product categories with hierarchical codes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Category ID |
| `name` | VARCHAR(100) | NOT NULL | Display name |
| `cat_slug` | VARCHAR(150) | NOT NULL | URL slug |
| `cat_code` | VARCHAR(50) | UNIQUE, NOT NULL | Hierarchical code (e.g. `000-001`) |
| `parent_code` | VARCHAR(50) | NULL | Parent `cat_code` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Hierarchy examples:**

| Level | cat_code | parent_code |
|-------|----------|-------------|
| Main | `000` | NULL |
| Sub | `000-001` | `000` |
| Sub-sub | `000-001-002` | `000-001` |

---

### `products`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Product ID |
| `category_id` | INT | NOT NULL, FK → `category.id` | Category |
| `name` | TEXT | NOT NULL | Product name |
| `description` | TEXT | | Description |
| `slug` | VARCHAR(200) | | URL slug |
| `price` | DOUBLE | NOT NULL | Unit price (BDT) |
| `photo` | VARCHAR(200) | | Primary image filename |
| `date_view` | DATE | | Last view date |
| `counter` | INT | DEFAULT 0 | View/sales counter |
| `quantity` | INT | DEFAULT 0 | Stock quantity |
| `sku` | VARCHAR(100) | UNIQUE | Stock keeping unit |
| `status` | ENUM | DEFAULT `'Active'` | `Active`, `Inactive` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### `cart`

Server-side cart (cleared on checkout; storefront primarily uses localStorage).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `user_id` | INT | NOT NULL, FK → `users.id` | |
| `product_id` | INT | NOT NULL, FK → `products.id` | |
| `quantity` | INT | NOT NULL | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### `orders`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Order ID |
| `customer_id` | INT | NOT NULL, FK → `users.id` | |
| `total_amount` | DECIMAL(10,2) | NOT NULL | Order total |
| `payment_method` | ENUM | | See payment enum below |
| `order_status` | ENUM | DEFAULT `'Pending'` | See order status enum |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `delivery_address_id` | INT | NULL | FK to `user_addresses.id` (added via migration) |
| `delivery_name` | VARCHAR(150) | NULL | Snapshot at checkout |
| `delivery_phone` | VARCHAR(30) | NULL | Snapshot at checkout |
| `delivery_address` | TEXT | NULL | Snapshot at checkout |
| `delivery_city` | VARCHAR(100) | NULL | Snapshot at checkout |

---

### `details`

Order line items (`sales_id` = order ID).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `sales_id` | INT | NOT NULL, FK → `orders.id` | Order ID |
| `product_id` | INT | NOT NULL, FK → `products.id` | |
| `quantity` | INT | NOT NULL | |
| `price` | DECIMAL(10,2) | | Unit price at time of order |

---

### `payments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `order_id` | INT | NOT NULL, FK → `orders.id` | |
| `transaction_id` | VARCHAR(100) | | e.g. `COD-{orderId}` |
| `amount` | DECIMAL(10,2) | | |
| `payment_status` | ENUM | DEFAULT `'Paid'` | See payment status enum |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

---

### `user_addresses`

Saved delivery addresses per customer.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `user_id` | INT | NOT NULL, FK → `users.id` ON DELETE CASCADE | |
| `label` | ENUM | DEFAULT `'Home'` | `Home`, `Office` |
| `recipient_name` | VARCHAR(150) | NOT NULL | |
| `phone_number` | VARCHAR(30) | NOT NULL | |
| `address_line` | TEXT | NOT NULL | |
| `city` | VARCHAR(100) | NOT NULL | |
| `area` | VARCHAR(100) | | |
| `postal_code` | VARCHAR(20) | | |
| `is_default` | TINYINT(1) | DEFAULT 0 | |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Index:** `idx_user_addresses_user` on `(user_id)`

---

### `product_reviews`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `product_id` | INT | NOT NULL, FK → `products.id` ON DELETE CASCADE | |
| `user_id` | INT | NOT NULL, FK → `users.id` ON DELETE CASCADE | |
| `rating` | TINYINT | NOT NULL, CHECK 1–5 | Star rating |
| `title` | VARCHAR(160) | | |
| `comment` | TEXT | NOT NULL | |
| `status` | ENUM | DEFAULT `'Approved'` | `Pending`, `Approved`, `Rejected` |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Index:** `idx_product_reviews_product_status` on `(product_id, status)`

---

### `support_tickets`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `user_id` | INT | NULL, FK → `users.id` ON DELETE SET NULL | |
| `name` | VARCHAR(150) | NOT NULL | |
| `email` | VARCHAR(150) | | |
| `phone_number` | VARCHAR(30) | NOT NULL | |
| `subject` | VARCHAR(180) | NOT NULL | |
| `message` | TEXT | NOT NULL | |
| `status` | ENUM | DEFAULT `'Open'` | `Open`, `In Progress`, `Resolved`, `Closed` |
| `admin_note` | TEXT | | Internal note |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | |

**Index:** `idx_support_tickets_status` on `(status)`

---

### `product_images`

Additional product gallery images.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | |
| `product_id` | INT | NOT NULL, FK → `products.id` ON DELETE CASCADE | |
| `image_url` | VARCHAR(500) | NOT NULL | Full or relative URL |
| `alt_text` | VARCHAR(180) | | |
| `sort_order` | INT | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | |

**Index:** `idx_product_images_product` on `(product_id, sort_order)`

---

## Enums

### `orders.payment_method`

| Value | Description |
|-------|-------------|
| `Cash On Delivery` | Pay on delivery |
| `Card` | Card payment |
| `Bkash` | bKash mobile wallet |
| `Nagad` | Nagad mobile wallet |

### `orders.order_status`

| Value | Description |
|-------|-------------|
| `Pending` | New order |
| `Processing` | Being fulfilled |
| `Completed` | Delivered / done |
| `Cancelled` | Cancelled |

### `payments.payment_status`

| Value | Description |
|-------|-------------|
| `Paid` | Payment received |
| `Unpaid` | Awaiting payment (typical for COD) |
| `Refunded` | Refunded |

### `admins.role`

`Super Admin` | `Manager` | `Support`

### `admins.status`

`Active` | `Inactive`

### `products.status`

`Active` | `Inactive`

### `product_reviews.status`

`Pending` | `Approved` | `Rejected`

### `support_tickets.status`

`Open` | `In Progress` | `Resolved` | `Closed`

### `user_addresses.label`

`Home` | `Office`

---

## Indexes

| Index | Table | Columns |
|-------|-------|---------|
| `idx_user_addresses_user` | `user_addresses` | `user_id` |
| `idx_product_reviews_product_status` | `product_reviews` | `product_id`, `status` |
| `idx_support_tickets_status` | `support_tickets` | `status` |
| `idx_product_images_product` | `product_images` | `product_id`, `sort_order` |

---

## Schema Migration Notes

The schema file uses stored procedures `add_column_if_missing` and `add_index_if_missing` to idempotently add:

- Delivery snapshot columns on `orders`
- Indexes on newer tables

These procedures are dropped after execution.

---

## Bootstrap Data

Before using the admin panel, create at least one admin:

```sql
-- Prefer POST /api/auth/register on admin backend (bcrypt hash)
-- Or insert manually with a bcrypt-hashed password
```

Seed categories and products via admin panel or direct SQL for development.

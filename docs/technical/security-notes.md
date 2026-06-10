# Security Notes

Known security issues and hardening recommendations for **TechTrends BD**.

This document reflects the **current implementation** as of the codebase review. Treat these items as priorities before exposing the platform to the public internet.

---

## Critical Issues

### 1. Customer password hashing (improved)

**Location:** `user/ecommerce_backend_2026/sql/models/user_model.js`

Customer passwords are now hashed with **bcrypt** on signup. Login verifies bcrypt hashes and still accepts **legacy plaintext** passwords from existing rows, upgrading them to bcrypt on successful login.

**Remaining risk:** Legacy plaintext rows remain vulnerable until each user logs in once. Consider a one-time migration script or forced password reset for production datasets created before this change.

**Recommendation:** Never log or return passwords in API responses. Remove legacy plaintext fallback after migration is complete.

---

### 2. No authentication on customer API mutations

**Location:** User backend — most `POST`/`PUT`/`DELETE` routes

These endpoints accept a `user_id` or `id` in the body/path with **no session token or ownership check**:

| Endpoint | Risk |
|----------|------|
| `POST /update-user` | Update any user by id |
| `GET/POST/DELETE /users/:userId/addresses` | Access any user's addresses |
| `GET /orders/:userId` | View any user's orders |
| `POST /checkout` | Place orders as any user |
| `POST /products/:productId/reviews` | Post reviews as any user |

**Risk:** IDOR (Insecure Direct Object Reference) — attackers can read/modify other users' data.

**Recommendation:**

- Issue JWT or session token on customer login
- Add auth middleware validating token `sub` matches `:userId`
- Reject mismatched user ids with `403`

---

### 3. Unauthenticated product creation

**Location:** `POST /productadd` on user backend

Anyone can add products without authentication.

**Recommendation:** Remove this route from production or protect with admin-only auth. Product management should go through admin backend only.

---

### 4. Unauthenticated admin user management — FIXED

**Location:** `admin/admin_panel_backend/routes/admin_routes/admin_auth.js`

**Status:** Resolved.

| Route | Protection |
|-------|------------|
| `GET /api/auth/admins` | JWT + Super Admin |
| `PUT /api/auth/admins/:id` | JWT + Super Admin |
| `DELETE /api/auth/admins/:id` | JWT + Super Admin |
| `POST /api/auth/register` | Bootstrap when `admins` table is empty; otherwise JWT + Super Admin |
| `GET /api/auth/me` | JWT required |

Password hashes are never returned. Inactive admins cannot log in. Login/register are rate-limited.

---

### 5. Unauthenticated image upload — FIXED

**Location:** `POST /upload` on admin backend

**Status:** Resolved. Upload requires JWT, validates MIME type and 5 MB size limit, and uses random filenames.

---

### 6. Plaintext admin login on user backend

**Location:** `POST /admin-login` on user backend

Compares `admin.password !== password` in plaintext (unlike admin backend which uses bcrypt).

**Risk:** Inconsistent security; if admins are created with bcrypt hashes, this route won't work; if plaintext, admins are exposed.

**Recommendation:** Remove `/admin-login` from user backend; use admin backend exclusively.

---

## High Issues

### 7. Open CORS on user backend

```javascript
app.use(cors());
```

All origins can call the user API from browsers.

**Recommendation:** Restrict to `NEXT_PUBLIC_SITE_URL` in production.

---

### 8. JWT cookie not secure by default — IMPROVED

**Location:** Admin auth login cookie

Admin backend now sets `secure: process.env.NODE_ENV === 'production'`. Consider `sameSite: 'strict'` for additional hardening in production.

---

### 9. Customer session in localStorage

**Location:** `user/ecommerce_frontend_2026/app/context/UserContext.js`

User object stored in `localStorage` without cryptographic binding to server.

**Risk:** XSS can steal user session data; no server-side logout invalidation.

**Recommendation:** Use httpOnly cookies + JWT for customer auth; implement CSP headers.

---

### 10. Reviews auto-approved

**Location:** `POST /products/:productId/reviews`

Reviews inserted with `status = 'Approved'` immediately.

**Risk:** Spam, abusive content visible instantly.

**Recommendation:** Default to `Pending`; moderate via admin panel.

---

### 11. Payment methods without gateway integration

bKash, Nagad, and Card mark payments as `Paid` without actual payment verification.

**Risk:** Orders marked paid without money received.

**Recommendation:** Integrate payment gateways; only mark paid after webhook confirmation.

---

## Medium Issues

### 12. SQL injection surface

Most queries use parameterized placeholders. Continue this pattern for any new code. Avoid string concatenation with user input.

### 13. Rate limiting absent

No rate limiting on login, signup, checkout, or upload endpoints.

**Recommendation:** Add `express-rate-limit` or reverse-proxy rate limits.

### 14. Error messages leak internals

Some endpoints return `error.message` from caught exceptions (e.g. checkout stock errors — acceptable; DB errors — less so).

**Recommendation:** Log details server-side; return generic messages to clients in production.

### 15. MinIO default credentials

Default `admin` / `password123` in examples.

**Recommendation:** Strong unique credentials; private network access only.

---

## Production Hardening Checklist

| Item | Action |
|------|--------|
| HTTPS | Terminate TLS on all public domains |
| Secrets | Strong `USER_JWT_SECRET`, `ADMIN_JWT_SECRET`, MySQL password |
| Admin API | Restrict to VPN, IP allowlist, or internal network |
| CORS | Lock `CLIENT_URL` to admin panel origin only |
| Passwords | bcrypt for customers and admins |
| Auth middleware | Protect all user-specific routes |
| Upload | Require admin JWT |
| Admin CRUD | Protect `/api/auth/admins*` routes |
| Cookies | `secure: true` in production |
| Headers | Add Helmet.js (CSP, X-Frame-Options, etc.) |
| Database | Least-privilege DB user (not root) |
| Backups | Encrypted MySQL backups |
| Monitoring | Log auth failures and upload activity |

---

## Positive Security Properties

| Feature | Detail |
|---------|--------|
| Admin passwords | bcrypt-hashed on register/login/update |
| Admin protected routes | JWT `verifyToken` on `/api/products`, `/api/orders`, `/upload`, etc. |
| Admin CRUD | Super Admin role required; bootstrap register when table empty |
| Upload hardening | Auth required; MIME/size validation; random filenames |
| Rate limiting | Login and register limited to 5 attempts per 15 minutes |
| Helmet | Security headers enabled on admin backend |
| Checkout transactions | Stock locked with `FOR UPDATE`; rollback on failure |
| Public user fields | Password excluded from SELECT projections |
| httpOnly admin cookie | JS cannot read admin JWT directly |
| Env validation | User backend fails fast on missing required env vars |

---

## Reporting

For production deployments, review this document alongside [Architecture](architecture.md) and restrict network exposure until critical items are addressed.

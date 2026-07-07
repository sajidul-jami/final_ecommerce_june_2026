# Architecture

Current system:

```text
Customer browser
  -> user frontend :3000
  -> user backend :3005
  -> MySQL :3306

Admin browser
  -> admin frontend :3002
  -> admin backend :3001
  -> MySQL :3306
  -> MinIO :9000
```

## Applications

| Application | Path | Responsibility |
| --- | --- | --- |
| User frontend | `user/ecommerce_frontend_2026` | Public ecommerce website |
| User backend | `user/ecommerce_backend_2026` | Public catalog, checkout, customer APIs |
| Admin frontend | `admin/admin_panel_frontend` | Store management UI |
| Admin backend | `admin/admin_panel_backend` | Admin APIs, database writes, uploads |

## Shared Infrastructure

| Service | Purpose |
| --- | --- |
| MySQL | Shared `ecommerce` database |
| MinIO | S3-compatible image/object storage |

## Image Flow

```text
Admin frontend
  -> admin backend /upload
  -> MinIO bucket ecommerce
  -> public image URL
  -> admin/user frontends display image
```

For Docker local, the public image base is normally:

```text
http://192.168.1.99:9000/ecommerce
```

## URL Strategy

SEO-friendly URLs are used for:

- Products: `/product/{product-slug}`
- Categories: `/category/{category-slug}`
- Brands: `/brand/{brand-slug}`
- Tags: `/tag/{tag-slug}`
- CMS pages: `/page/{page-slug}`

Legacy product URLs under `/singleproduct/{id}` redirect to slug URLs when possible.

## Dynamic Settings

Site settings are managed in the admin panel and loaded by the user frontend/backend for:

- Website name/logo/favicon
- Footer content
- Contact info
- SEO metadata
- Tracking scripts
- Delivery charges

## Database And Migrations

Fresh Docker DB:

```text
mysql-container/initdb
```

Existing DB copy-paste migrations:

```text
sql scema
```

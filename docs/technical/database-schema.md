# Database Schema

Database name: `ecommerce`

Fresh Docker MySQL initializes from:

```text
mysql-container/initdb
```

Existing databases should be updated with copy-paste migration files from:

```text
sql scema
```

## Important Tables

| Table | Purpose |
| --- | --- |
| `products` | Product catalog |
| `category` | Product categories |
| `brands` | Brand records, image, description, SEO, status |
| `product_tags` | Product tags and tag slugs |
| `customers` | Registered customers |
| `orders` | Orders, checkout info, delivery zone/charge |
| `details` | Order line items |
| `reviews` | Product reviews |
| `site_settings` | Website/footer/SEO/contact/tracking/delivery settings |
| `cms_pages` | Slug-based CMS pages |

## Recently Added/Important Columns

| Table | Columns |
| --- | --- |
| `products` | `slug`, `brand_id`, `country_of_origin` |
| `brands` | `slug`, `logo`, `description`, `status`, `seo_title`, `seo_description`, `seo_keywords` |
| `orders` | `delivery_zone`, `delivery_charge`, guest checkout fields |
| `site_settings` | logos, favicon, meta fields, footer fields, analytics, delivery charges |
| `product_tags` | `slug` |
| `cms_pages` | `slug`, `meta_title`, `meta_description`, `meta_keywords`, `status` |

## Migration Rule

When adding schema changes, create both files:

```text
mysql-container/initdb/YYYY-MM-DD_feature.sql
sql scema/YYYY-MM-DD_feature.sql
```

The Docker init version helps new installs. The `sql scema` version is for existing databases.

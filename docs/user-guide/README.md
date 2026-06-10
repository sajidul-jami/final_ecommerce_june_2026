# User Guide

This section covers how to use **TechTrends BD** from an end-user and store-operator perspective.

## Who should read this

| Guide | Audience |
|-------|----------|
| [Customer Shopping Guide](customer-shopping-guide.md) | Shoppers using the public storefront |
| [Admin Panel Guide](admin-panel-guide.md) | Store managers, support staff, and administrators |

## Customer storefront

The public site runs at **http://localhost:3000** in local development (replace with your production domain in live environments).

Key capabilities:

- Browse products by category and search
- View product details, ratings, and reviews
- Add items to a cart (stored in the browser)
- Create an account and manage delivery addresses
- Checkout with Bangladesh payment options (COD, bKash, Nagad, Card)
- Track orders and submit support requests

→ [Full customer guide](customer-shopping-guide.md)

## Admin panel

The admin panel runs at **http://localhost:3002** locally. It connects to the admin API on port **3001**.

Key capabilities:

- Dashboard with revenue, orders, and low-stock alerts
- Order management and status updates
- Product and category CRUD with image upload
- Customer list
- Sales analytics
- Admin user management

→ [Full admin guide](admin-panel-guide.md)

## Getting help

- **Customers:** Use the Help & Support page on the storefront (`/help_support`) or see the support section in the [customer guide](customer-shopping-guide.md).
- **Developers / operators:** See the [technical documentation](../technical/README.md) for API references, deployment, and troubleshooting at the infrastructure level.

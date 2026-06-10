# Customer Shopping Guide

This guide explains how to shop on **TechTrends BD**, the customer-facing ecommerce storefront.

## Overview

TechTrends BD is an online tech store for Bangladesh. Prices are shown in **BDT (৳)** using Bangladesh locale formatting. You can browse products, add them to your cart, create an account, and complete checkout with local payment methods.

**Store URL (local):** http://localhost:3000

---

## Browsing Products

### Home page

The home page (`/`) displays:

- Category navigation sidebar
- Featured and limited-time offer products
- A searchable product grid

### Filtering by category

1. Use the **category sidebar** on the left to browse by product type (e.g. Laptop, Mobile, Gaming, Accessories).
2. Categories support a hierarchical structure (main → sub → sub-sub) identified by `cat_code` values such as `000`, `000-001`, `100`.
3. Clicking a category updates the URL (e.g. `/?category=000#shop`) and filters the product list.

### Search

Use the search bar to find products by name, description, SKU, or category. Search updates the URL with a `search` query parameter.

### Sorting

Products can be sorted by:

| Sort option | Description |
|-------------|-------------|
| Newest (default) | Most recently added first |
| Best selling | Highest sales counter |
| Price low → high | Ascending price |
| Price high → low | Descending price |
| Name A → Z | Alphabetical |

### Product cards

Each product card shows:

- Product image (from MinIO CDN or default placeholder)
- Name and price in BDT
- Average star rating and review count (when available)
- Stock availability

Click a card to open the product detail page.

---

## Product Detail Page

URL pattern: `/singleproduct/[id]`

On the product detail page you can:

- View full description, price, and stock quantity
- See multiple product images in a gallery
- Read approved customer reviews and average rating
- Adjust quantity and **Add to Cart**
- See supported payment methods: COD, bKash, Nagad

**Note:** Viewing a product increments its view counter unless `?view=0` is passed (used internally).

---

## Shopping Cart

URL: `/cart`

The cart is stored in your **browser's localStorage**, not on the server. This means:

- Your cart persists across page refreshes on the same browser
- Clearing browser data removes your cart
- The cart is not synced across devices unless you log in and complete checkout

### Cart features

| Action | How |
|--------|-----|
| Add item | Click **Add to Cart** on a product page or card |
| Increase quantity | Use the **+** button (respects available stock) |
| Decrease quantity | Use the **−** button |
| Remove item | Delete button on the cart row |
| Select items | Checkbox per row; **Select All** for bulk actions |
| Remove selected | Removes all checked items |
| Buy now | Select items → **Buy Now** → proceeds to checkout |

### Stock limits

If you try to add more than available stock, you will see a **"No more stock available"** message. The cart enforces the product's `quantity` field from the database.

---

## Account

### Sign up

URL: `/login_signup/signup`

Required fields:

- **Phone number** (primary identifier)
- **Password**

Optional fields: full name, email, address, city, location.

If you omit an email, the system generates one automatically from your phone number.

### Log in

URL: `/login_signup/login`

Log in with your **phone number or email** and **password**.

After login, your session is stored in **localStorage** (`user` key). You remain logged in until you log out or clear browser data.

### Redirect after login

If you were redirected to login from checkout or another protected flow, you return to that page automatically via the `?redirect=` query parameter.

---

## User Profile

URL: `/user_profile`

When logged in, your profile page lets you:

### Personal information

- Update full name, phone, address, and city
- Changes are saved to the server via the update-user API

### Delivery addresses

Manage multiple saved addresses with:

| Field | Description |
|-------|-------------|
| Label | Home or Office |
| Recipient name | Delivery contact name |
| Phone number | Delivery contact phone |
| Address line | Street / building details |
| City | Delivery city |
| Area | Optional area/neighbourhood |
| Postal code | Optional |
| Default | Mark one address as default |

### Order history

View past orders with:

- Order ID and date
- Order status: Pending, Processing, Completed, Cancelled
- Payment method and payment status (Paid / Unpaid)
- Line items with product name, quantity, and price

---

## Checkout

URL: `/checkout`

Checkout requires you to be **logged in**. If you click Buy Now while logged out, you are sent to login first.

### Steps

1. **Select items** on the cart page and click **Buy Now** (selected items are stored in `sessionStorage`).
2. **Choose or enter delivery details:**
   - Select a saved address from the dropdown, or
   - Enter full name, phone, delivery address, and city manually
3. **Choose payment method** (see below).
4. Review order items and total in BDT.
5. Click **Confirm Order**.

On success:

- Stock is decremented in the database
- An order and payment record are created
- Your cart items are cleared
- You are redirected to your profile with a confirmation alert showing the **Order ID**

### Payment methods

| Method | Description | Payment status after order |
|--------|-------------|---------------------------|
| **Cash On Delivery (COD)** | Pay when the order is delivered | Unpaid |
| **bKash** | Mobile financial service (Bangladesh) | Paid |
| **Nagad** | Mobile financial service (Bangladesh) | Paid |
| **Card** | Debit/credit card | Paid |

**Important:** bKash, Nagad, and Card selections mark the payment as **Paid** in the system but do not integrate with live payment gateways in the current implementation. Treat them as order-type labels unless a payment gateway is added.

### Delivery snapshot

Your name, phone, address, and city at checkout are saved on the order as delivery snapshot fields for fulfilment even if you later change your profile.

---

## Reviews

On any product detail page, logged-in customers can:

- Read approved reviews from other customers
- Submit a review with:
  - Rating (1–5 stars, required)
  - Title (optional)
  - Comment (required)

Reviews are stored with status **Approved** immediately in the current implementation (no moderation queue on the customer side).

---

## Help & Support

URL: `/help_support`

Submit a support ticket with:

- Name (required)
- Phone number (required)
- Email (optional)
- Subject (required)
- Message (required)

If you are logged in, your user ID is attached to the ticket. Tickets are created with status **Open** and can be managed from the admin side.

Use this page for order issues, payment questions, delivery problems, product warranty queries, and general enquiries.

---

## Currency

All prices display in **Bangladeshi Taka (BDT)** using the format:

```
৳1,234   (no decimal places by default)
```

The storefront uses `Intl.NumberFormat('en-BD', { style: 'currency', currency: 'BDT' })`.

---

## Tips & Troubleshooting

| Issue | Solution |
|-------|----------|
| Cart is empty after checkout | Expected — purchased items are removed from cart |
| Cart lost on different browser | Cart is browser-local; log in before checkout on each device |
| Cannot checkout | Ensure you are logged in and have selected cart items |
| "No checkout items found" | Return to cart, select items, and click Buy Now again |
| Stock error at checkout | Another customer may have purchased remaining stock; reduce quantity |
| Images not loading | Check that MinIO/CDN URL is configured (`NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL`) |
| Login fails | Verify phone/email and password; account must have `status = 1` (active) |

For store-operator issues (order not updating, wrong stock), contact the store administrator or submit a support ticket.

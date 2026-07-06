# MySQL Container

Fresh production-style MySQL bootstrap for the ecommerce app.

Run:

```sh
cp .env.example .env
docker compose up -d
```

The first startup runs every SQL file in `initdb/`.

Initial admin:

- Email: `admin@ecommerce.local`
- Password: `Admin@2026`

Change this password after first login.

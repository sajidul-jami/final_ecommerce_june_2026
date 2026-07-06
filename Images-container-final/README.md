# Images Container Final

This MinIO setup creates one public bucket named `ecommerce`.

Object layout:

- `products/<product-slug>/<image-file>` for product images
- `slideshow/<image-file>` for homepage slideshow images
- `logo/website/<image-file>` for website logos
- `logo/brands/<image-file>` for brand logos
- `products/noimage.jpg` for the fallback image, if you upload one

Run:

```sh
cp .env.example .env
docker compose up -d
```

Local URLs:

- Public image base: `http://localhost:9000/ecommerce`
- Console: `http://localhost:9001`

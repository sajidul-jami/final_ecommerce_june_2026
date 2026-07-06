#!/bin/sh
set -eu

MINIO_HOST="${MINIO_HOST:-minio}"
MINIO_PORT="${MINIO_PORT:-9000}"
MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:?MINIO_ACCESS_KEY is required}"
MINIO_SECRET_KEY="${MINIO_SECRET_KEY:?MINIO_SECRET_KEY is required}"
MINIO_BUCKET="${MINIO_BUCKET:-ecommerce}"

echo "Waiting for MinIO at ${MINIO_HOST}:${MINIO_PORT}..."
until mc alias set local "http://${MINIO_HOST}:${MINIO_PORT}" "${MINIO_ACCESS_KEY}" "${MINIO_SECRET_KEY}"; do
  sleep 2
done


mc mb --ignore-existing "local/${MINIO_BUCKET}"
mc anonymous set download "local/${MINIO_BUCKET}"

# MinIO has no real folders; these zero-byte marker objects make the intended
# ecommerce layout visible in the console before uploads start.
for prefix in \
  "products/" \
  "slideshow/" \
  "logo/" \
  "logo/website/" \
  "logo/brands/"
do
  printf '' | mc pipe "local/${MINIO_BUCKET}/${prefix}.keep"
done

echo "MinIO bucket '${MINIO_BUCKET}' is ready with ecommerce prefixes."

#!/bin/sh
set -eu

cd "$(dirname "$0")/.."
docker compose down -v
docker compose up -d

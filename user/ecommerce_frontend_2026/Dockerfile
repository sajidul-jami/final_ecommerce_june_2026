FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
ARG NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://localhost:9000/products/images/productsimg
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=$NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:3005
ARG NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=http://localhost:9000/products/images/productsimg
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL=$NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]

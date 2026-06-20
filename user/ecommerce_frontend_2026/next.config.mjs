/** @type {import('next').NextConfig} */
const productImageBaseUrl =
  process.env.NEXT_PUBLIC_PRODUCT_IMAGE_BASE_URL || 'http://localhost:9000/products/images/productsimg';
const productImageUrl = productImageBaseUrl ? new URL(productImageBaseUrl) : null;

const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: process.env.NEXT_ALLOWED_DEV_ORIGINS
    ? process.env.NEXT_ALLOWED_DEV_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [],

  images: {
    dangerouslyAllowLocalIP: process.env.NEXT_ALLOW_LOCAL_IMAGES === 'true',

    remotePatterns: productImageUrl
      ? [
          {
            protocol: productImageUrl.protocol.replace(':', ''),
            hostname: productImageUrl.hostname,
            port: productImageUrl.port,
            pathname: `${productImageUrl.pathname.replace(/\/$/, '')}/**`,
          },
        ]
      : [],
  },
};

export default nextConfig;

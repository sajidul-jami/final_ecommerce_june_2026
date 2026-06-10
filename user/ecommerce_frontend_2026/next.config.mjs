/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  allowedDevOrigins: ['192.168.1.99'],

  images: {
    dangerouslyAllowLocalIP: true,

    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.146',
        port: '9000',
        pathname: '/products/images/productsimg/**',
      },
    ],
  },
};

export default nextConfig;

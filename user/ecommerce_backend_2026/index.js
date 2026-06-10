require('dotenv').config();

const express = require('express');
const pool = require('./sql/pool');
const { corsMiddleware, allowedOriginSet } = require('./middleware/cors');
const errorHandler = require('./middleware/error_handler');

const healthRoutes = require('./routes/health_routes');
const authRoutes = require('./routes/auth_routes');
const addressRoutes = require('./routes/address_routes');
const orderRoutes = require('./routes/order_routes');
const categoryRoutes = require('./routes/category_routes');
const productRoutes = require('./routes/product_routes');
const reviewRoutes = require('./routes/review_routes');
const supportRoutes = require('./routes/support_routes');
const checkoutRoutes = require('./routes/checkout_routes');

const port = process.env.PORT || 3005;
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
}

const app = express();

app.use(corsMiddleware);
app.use(express.json());

app.use(healthRoutes);
app.use(authRoutes);
app.use(addressRoutes);
app.use(orderRoutes);
app.use(categoryRoutes);
app.use(productRoutes);
app.use(reviewRoutes);
app.use(supportRoutes);
app.use(checkoutRoutes);

app.use(errorHandler);

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Ecommerce API listening on http://0.0.0.0:${port}`);
  if (allowedOriginSet.size > 0) {
    console.log('Allowed CORS origins:', [...allowedOriginSet]);
  }
});

require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const app = express()

const port = process.env.PORT || 3001


// =========================================
// MIDDLEWARE
// =========================================
app.use(express.json())

app.use(express.urlencoded({
    extended: true
}))

// =========================================
// CORS
// =========================================
const allowedOrigins = [
    process.env.CLIENT_URL,
    process.env.ADMIN_CLIENT_URL,
    process.env.CORS_ORIGINS
]
    .filter(Boolean)
    .join(',')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const allowedOriginSet = new Set(allowedOrigins)

const isPrivateIpv4 = (hostname) =>
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)

const isDevHost = (hostname) =>
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    isPrivateIpv4(hostname)

const isAllowedOrigin = (origin) => {
    if (!origin) return true
    if (allowedOriginSet.has(origin)) return true

    try {
        const url = new URL(origin)

        if (process.env.NODE_ENV !== 'production' && isDevHost(url.hostname)) {
            return true
        }
    } catch {
        return false
    }

    return false
}

app.use(cors({
    origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
            return callback(null, true)
        }

        if (process.env.NODE_ENV !== 'production') {
            console.warn('[CORS] Blocked origin:', origin)
        }

        return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// =========================================
// COOKIE PARSER
// =========================================
app.use(cookieParser())


// =========================================
// AUTH MIDDLEWARE
// =========================================
const verifyToken = require('./middleware/auth_middleware')


// =========================================
// ROUTES
// =========================================
const test_ = require('./routes/admin_routes/admin')

const productRoutes = require('./routes/admin_routes/product_routes')

const orderRoutes = require('./routes/admin_routes/order_routes')

const salesRoutes = require('./routes/admin_routes/sales_routes')

const adminRoutes = require('./routes/admin_routes/admin_auth')

const customerRoutes = require('./routes/admin_routes/customer_routes')

const uploadRoutes = require('./routes/admin_routes/upload_routes')

const categoryRoutes = require('./routes/admin_routes/category_routes')
const contentRoutes = require('./routes/admin_routes/content_routes')

app.use('/upload', uploadRoutes)


// =========================================
// PUBLIC ROUTES
// =========================================
app.use('/api/auth', adminRoutes)


// =========================================
// PROTECTED ROUTES
// =========================================
app.use('/api/admin', verifyToken, test_)

app.use('/api/products', verifyToken, productRoutes)

app.use('/api/categories', verifyToken, categoryRoutes)

app.use('/api/orders', verifyToken, orderRoutes)

app.use('/api/sales', verifyToken, salesRoutes)

app.use('/api/customers', verifyToken, customerRoutes)

app.use('/api/content', verifyToken, contentRoutes)

app.get('/health', (req, res) => {
    res.json({ ok: true, service: 'admin-backend' })
})


// =========================================
// TEST ROUTE
// =========================================
app.get(
    '/profile/:profile_name',
    verifyToken,
    (req, res) => {

        res.send(
            `${req.ip} Hello ${req.params.profile_name}!`
        )
    }
)


// =========================================
// SERVER START
// =========================================
app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`)
    console.log('Allowed CORS origins:', [...allowedOriginSet])
})

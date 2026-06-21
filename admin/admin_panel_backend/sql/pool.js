// pool.js

const mysql = require('mysql2');

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
    throw new Error(`Missing required database environment variable(s): ${missingEnv.join(', ')}`);
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306),

    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// optional check
db.getConnection((err, connection) => {
    if (err) {
        console.log('DB Connection Failed:', err);
    } else {
        console.log('MySQL Pool Connected');
        connection.release();
    }
});

module.exports = db;

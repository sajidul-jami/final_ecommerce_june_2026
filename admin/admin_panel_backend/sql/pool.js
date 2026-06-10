// pool.js

const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'ecommerce',

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
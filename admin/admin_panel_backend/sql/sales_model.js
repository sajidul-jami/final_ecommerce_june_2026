const db = require('./pool');


// =========================
// TOTAL SALES
// =========================
const getTotalSales = (callback) => {

    db.query(`
        SELECT SUM(total_amount) AS total_sales
        FROM orders
        WHERE order_status = 'Completed'
    `, callback)
}


// =========================
// RECENT SALES
// =========================
const getRecentSales = (callback) => {

    db.query(`
        SELECT 
            orders.id,
            users.full_name,
            orders.total_amount,
            orders.created_at
        FROM orders
        LEFT JOIN users
            ON orders.customer_id = users.id
        WHERE orders.order_status = 'Completed'
        ORDER BY orders.created_at DESC
        LIMIT 10
    `, callback)
}


// =========================
// PAYMENT ANALYTICS
// =========================
const getPaymentAnalytics = (callback) => {

    db.query(`
        SELECT 
            payment_method,
            COUNT(*) AS total_orders,
            SUM(total_amount) AS total_sales
        FROM orders
        WHERE order_status = 'Completed'
        GROUP BY payment_method
    `, callback)
}

module.exports = {
    getTotalSales,
    getRecentSales,
    getPaymentAnalytics
}
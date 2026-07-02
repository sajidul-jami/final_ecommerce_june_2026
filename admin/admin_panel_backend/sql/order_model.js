const db = require('./pool');


// =========================
// GET ALL ORDERS
// =========================
const getAllOrders = (callback) => {

    const query = `
        SELECT 
            orders.id,
            COALESCE(users.full_name, users.user_name, orders.delivery_name, 'Guest customer') AS full_name,
            orders.total_amount,
            orders.payment_method,
            orders.order_status,
            orders.created_at
        FROM orders
        LEFT JOIN users 
            ON orders.customer_id = users.id
        ORDER BY orders.id DESC
    `

    db.query(query, callback)
}


// =========================
// GET SINGLE ORDER WITH ITEMS
// =========================
const getOrderById = (id, callback) => {

    const query = `
        SELECT
            o.id AS order_id,
            COALESCE(u.full_name, u.user_name, o.delivery_name, 'Guest customer') AS full_name,
            COALESCE(u.email, o.delivery_email) AS email,
            COALESCE(u.phone_number, o.delivery_phone) AS phone,
            COALESCE(u.address, o.delivery_address) AS address,
            o.delivery_city,
            o.delivery_area,
            o.order_notes,
            o.checkout_type,
            o.total_amount,
            o.payment_method,
            o.order_status,
            o.created_at,
            d.product_id,
            p.name AS product_name,
            d.quantity,
            d.price
        FROM orders o
        LEFT JOIN users u ON o.customer_id = u.id
        LEFT JOIN details d ON d.sales_id = o.id
        LEFT JOIN products p ON d.product_id = p.id
        WHERE o.id = ?
        ORDER BY d.id ASC
    `

    db.query(query, [id], callback)
}


// =========================
// CREATE ORDER
// =========================
const createOrder = (data, callback) => {

    const query = `
        INSERT INTO orders
        (customer_id, total_amount, payment_method, order_status)
        VALUES (?, ?, ?, ?)
    `

    db.query(query, [
        data.customer_id,
        data.total_amount,
        data.payment_method,
        data.order_status || 'Pending'
    ], callback)
}


// =========================
// UPDATE ORDER STATUS
// =========================
const updateOrderStatus = (id, status, callback) => {

    const query = `
        UPDATE orders
        SET order_status = ?
        WHERE id = ?
    `

    db.query(query, [status, id], callback)
}


// =========================
// DELETE ORDER
// =========================
const deleteOrder = (id, callback) => {

    db.query(`DELETE FROM orders WHERE id = ?`, [id], callback)
}


module.exports = {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
}

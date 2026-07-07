const db = require('./pool')

const getAllCustomers = (callback) => {
    db.query(
        `
            SELECT
                CONCAT('user-', id) AS id,
                id AS customer_id,
                full_name,
                email,
                phone_number,
                address,
                city,
                created_at,
                'Registered' AS customer_type,
                0 AS order_count
            FROM users
            UNION ALL
            SELECT
                CONCAT('guest-', MIN(id)) AS id,
                NULL AS customer_id,
                COALESCE(delivery_name, 'Guest customer') AS full_name,
                delivery_email AS email,
                delivery_phone AS phone_number,
                delivery_address AS address,
                delivery_city AS city,
                MIN(created_at) AS created_at,
                'Guest' AS customer_type,
                COUNT(*) AS order_count
            FROM orders
            WHERE customer_id IS NULL
              AND (delivery_phone IS NOT NULL OR delivery_email IS NOT NULL)
            GROUP BY delivery_phone, delivery_email, delivery_name, delivery_address, delivery_city
            ORDER BY id DESC
        `,
        callback
    )
}

module.exports = {
    getAllCustomers
}

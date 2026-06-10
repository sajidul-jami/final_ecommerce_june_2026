const db = require('./pool')

const getAllCustomers = (callback) => {
    db.query(
        `
            SELECT
                id,
                full_name,
                email,
                phone_number,
                address,
                city,
                created_at
            FROM users
            ORDER BY id DESC
        `,
        callback
    )
}

module.exports = {
    getAllCustomers
}

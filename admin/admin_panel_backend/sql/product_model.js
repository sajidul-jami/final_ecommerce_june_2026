const db = require('./pool');

const missingColumn = (error) =>
    error?.code === 'ER_BAD_FIELD_ERROR' || /unknown column/i.test(error?.message || '');

// GET ALL
const getAllProducts = (callback) => {
    db.query(
        `SELECT p.*, c.name AS category_name, b.name AS brand_name
         FROM products p
         LEFT JOIN category c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand_id`,
        (err, rows) => {
            if (!err) return callback(null, rows);
            if (!missingColumn(err) && err?.code !== 'ER_NO_SUCH_TABLE') return callback(err);

            db.query(
                `SELECT p.*, c.name AS category_name
                 FROM products p
                 LEFT JOIN category c ON c.id = p.category_id`,
                callback
            );
        }
    );
};

// GET ONE
const getProductById = (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
};

// ADD
const addProduct = (data, callback) => {
    const queryWithBrand = `
        INSERT INTO products
        (category_id, brand_id, name, sku, price, quantity, description, photo)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const query = `
        INSERT INTO products 
        (category_id, name, sku, price, quantity, description, photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const fallback = () => db.query(query, [
        data.category_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo
    ], callback);

    if (!data.brand_id) return fallback();

    db.query(queryWithBrand, [
        data.category_id,
        data.brand_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo
    ], (err, result) => {
        if (err && missingColumn(err)) return fallback();
        callback(err, result);
    });
};

// UPDATE
const updateProduct = (id, data, callback) => {
    const queryWithBrand = `
        UPDATE products
        SET category_id=?, brand_id=?, name=?, sku=?, price=?, quantity=?, description=?, photo=?
        WHERE id=?
    `;
    const query = `
        UPDATE products 
        SET category_id=?, name=?, sku=?, price=?, quantity=?, description=?, photo=?
        WHERE id=?
    `;

    const fallback = () => db.query(query, [
        data.category_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo,
        id
    ], callback);

    if (!data.brand_id) return fallback();

    db.query(queryWithBrand, [
        data.category_id,
        data.brand_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo,
        id
    ], (err, result) => {
        if (err && missingColumn(err)) return fallback();
        callback(err, result);
    });
};

// DELETE
const deleteProduct = (id, callback) => {
    db.query('DELETE FROM products WHERE id = ?', [id], callback);
};

module.exports = {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
};

const db = require('./pool');

// GET ALL
const getAllProducts = (callback) => {
    db.query('SELECT * FROM products', callback);
};

// GET ONE
const getProductById = (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], callback);
};

// ADD
const addProduct = (data, callback) => {
    const query = `
        INSERT INTO products 
        (category_id, name, sku, price, quantity, description, photo)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(query, [
        data.category_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo
    ], callback);
};

// UPDATE
const updateProduct = (id, data, callback) => {
    const query = `
        UPDATE products 
        SET category_id=?, name=?, sku=?, price=?, quantity=?, description=?, photo=?
        WHERE id=?
    `;

    db.query(query, [
        data.category_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo,
        id
    ], callback);
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
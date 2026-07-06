const db = require('./pool');

const missingColumn = (error) =>
    error?.code === 'ER_BAD_FIELD_ERROR' || /unknown column/i.test(error?.message || '');

const missingTable = (error) =>
    error?.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error?.message || '');

const normalizeImages = (images, fallbackPhoto, productName) => {
    const values = Array.isArray(images) ? images : [];
    const imageKeys = values
        .map((image) => typeof image === 'string' ? image : image?.image_url || image?.fileName || image?.objectKey)
        .filter(Boolean);

    if (fallbackPhoto && !imageKeys.includes(fallbackPhoto)) {
        imageKeys.unshift(fallbackPhoto);
    }

    return imageKeys.map((image_url, index) => ({
        image_url,
        alt_text: productName || '',
        sort_order: index
    }));
};

const attachProductImages = (rows, callback) => {
    const productRows = Array.isArray(rows) ? rows : [];
    const productIds = productRows.map((row) => Number(row.id)).filter(Boolean);

    if (!productIds.length) return callback(null, rows);

    db.query(
        `SELECT product_id, image_url, alt_text, sort_order
         FROM product_images
         WHERE product_id IN (?)
         ORDER BY sort_order ASC, id ASC`,
        [productIds],
        (err, imageRows) => {
            if (err) {
                if (missingTable(err)) return callback(null, rows);
                return callback(err);
            }

            const imageMap = new Map();
            imageRows.forEach((image) => {
                const productId = Number(image.product_id);
                const images = imageMap.get(productId) || [];
                images.push({
                    image_url: image.image_url,
                    alt_text: image.alt_text || '',
                    sort_order: image.sort_order || 0
                });
                imageMap.set(productId, images);
            });

            productRows.forEach((product) => {
                product.images = imageMap.get(Number(product.id)) || [];
            });

            callback(null, rows);
        }
    );
};

const replaceProductImages = (productId, data, callback) => {
    const images = normalizeImages(data.images, data.photo, data.name);

    db.query('DELETE FROM product_images WHERE product_id = ?', [productId], (deleteErr) => {
        if (deleteErr) {
            if (missingTable(deleteErr)) return callback(null);
            return callback(deleteErr);
        }

        if (!images.length) return callback(null);

        const values = images.map((image) => [
            productId,
            image.image_url,
            image.alt_text,
            image.sort_order
        ]);

        db.query(
            'INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES ?',
            [values],
            (insertErr) => {
                if (insertErr && missingTable(insertErr)) return callback(null);
                callback(insertErr);
            }
        );
    });
};

// GET ALL
const getAllProducts = (callback) => {
    db.query(
        `SELECT p.*, c.name AS category_name, b.name AS brand_name
         FROM products p
         LEFT JOIN category c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand_id`,
        (err, rows) => {
            if (!err) return attachProductImages(rows, callback);
            if (!missingColumn(err) && err?.code !== 'ER_NO_SUCH_TABLE') return callback(err);

            db.query(
                `SELECT p.*, c.name AS category_name
                 FROM products p
                 LEFT JOIN category c ON c.id = p.category_id`,
                (fallbackErr, rows) => {
                    if (fallbackErr) return callback(fallbackErr);
                    attachProductImages(rows, callback);
                }
            );
            return;
        }
    );
};

// GET ONE
const getProductById = (id, callback) => {
    db.query('SELECT * FROM products WHERE id = ?', [id], (err, rows) => {
        if (err) return callback(err);
        attachProductImages(rows, callback);
    });
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

    const finish = (err, result) => {
        if (err) return callback(err);
        replaceProductImages(result.insertId, data, (imageErr) => {
            if (imageErr) return callback(imageErr);
            callback(null, result);
        });
    };

    const fallback = () => db.query(query, [
        data.category_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo
    ], finish);

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
        finish(err, result);
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

    const finish = (err, result) => {
        if (err) return callback(err);
        replaceProductImages(id, data, (imageErr) => {
            if (imageErr) return callback(imageErr);
            callback(null, result);
        });
    };

    const fallback = () => db.query(query, [
        data.category_id,
        data.name,
        data.sku,
        data.price,
        data.quantity,
        data.description,
        data.photo,
        id
    ], finish);

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
        finish(err, result);
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

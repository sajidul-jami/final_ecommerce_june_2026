const db = require('./pool')

// =========================
// GET ALL CATEGORY
// =========================
const getAllCategories = (callback) => {
    db.query('SELECT * FROM category ORDER BY cat_code ASC', callback)
}

// =========================
// GET SINGLE CATEGORY
// =========================
const getCategoryById = (id, callback) => {
    db.query('SELECT * FROM category WHERE id = ?', [id], callback)
}

// =========================
// ADD CATEGORY (STRICT HIERARCHY)
// =========================
const addCategory = (data, callback) => {

    const { name, cat_slug, cat_code, parent_code } = data

    const level = cat_code.split('-').length

    // =========================
    // RULE 1: MAIN CATEGORY
    // =========================
    if (level === 1 && parent_code) {
        return callback(new Error('Main category cannot have parent_code'), null)
    }

    // =========================
    // RULE 2: SUB CATEGORY
    // =========================
    if (level === 2 && !parent_code) {
        return callback(new Error('Sub category must have parent_code'), null)
    }

    // =========================
    // RULE 3: SUB-SUB CATEGORY
    // =========================
    if (level === 3 && !parent_code) {
        return callback(new Error('Sub-sub category must have parent_code'), null)
    }

    // =========================
    // CHECK PARENT EXISTS (if needed)
    // =========================
    const insert = () => {
        const query = `
            INSERT INTO category 
            (name, cat_slug, cat_code, parent_code)
            VALUES (?, ?, ?, ?)
        `

        db.query(query, [
            name,
            cat_slug,
            cat_code,
            parent_code || null
        ], callback)
    }

    if (parent_code) {
        db.query(
            'SELECT * FROM category WHERE cat_code = ?',
            [parent_code],
            (err, result) => {
                if (err) return callback(err, null)

                if (!result.length) {
                    return callback(new Error('Parent category not found'), null)
                }

                insert()
            }
        )
    } else {
        insert()
    }
}

// =========================
// UPDATE CATEGORY
// =========================
const updateCategory = (id, data, callback) => {

    const query = `
        UPDATE category 
        SET name=?, cat_slug=?, cat_code=?, parent_code=?
        WHERE id=?
    `

    db.query(query, [
        data.name,
        data.cat_slug,
        data.cat_code,
        data.parent_code || null,
        id
    ], callback)
}

// =========================
// DELETE CATEGORY
// =========================
const deleteCategory = (id, callback) => {

    // optional safety: prevent deleting if children exist
    db.query(
        'SELECT * FROM category WHERE parent_code = (SELECT cat_code FROM category WHERE id = ?)',
        [id],
        (err, result) => {

            if (err) return callback(err, null)

            if (result.length > 0) {
                return callback(new Error('Cannot delete category with sub categories'), null)
            }

            db.query('DELETE FROM category WHERE id = ?', [id], callback)
        }
    )
}

module.exports = {
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
}
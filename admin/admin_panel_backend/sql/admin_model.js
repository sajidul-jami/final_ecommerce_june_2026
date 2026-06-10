const db = require('./pool')


// ============================
// FIND ADMIN BY EMAIL
// ============================
const findAdminByEmail = (email, callback) => {

    const query = `
        SELECT *
        FROM admins
        WHERE email = ?
    `

    db.query(query, [email], callback)
}


// ============================
// CREATE ADMIN
// ============================
const createAdmin = (data, callback) => {

    const query = `
        INSERT INTO admins
        (full_name, email, password, role, phone)
        VALUES (?, ?, ?, ?, ?)
    `

    db.query(query, [
        data.full_name,
        data.email,
        data.password,
        data.role,
        data.phone
    ], callback)
}


// ============================
// GET ALL ADMINS
// ============================
const getAllAdmins = (callback) => {

    const query = `
        SELECT
            id,
            full_name,
            email,
            role,
            phone,
            status,
            created_at
        FROM admins
        ORDER BY id DESC
    `

    db.query(query, callback)
}


// ============================
// UPDATE ADMIN
// ============================
const updateAdmin = (id, data, callback) => {

    const query = `
        UPDATE admins
        SET
            full_name = ?,
            email = ?,
            role = ?,
            phone = ?,
            status = ?
        WHERE id = ?
    `

    db.query(query, [
        data.full_name,
        data.email,
        data.role,
        data.phone,
        data.status,
        id
    ], callback)
}


// ============================
// DELETE ADMIN
// ============================
const deleteAdmin = (id, callback) => {

    const query = `
        DELETE FROM admins
        WHERE id = ?
    `

    db.query(query, [id], callback)
}


// ============================
module.exports = {
    findAdminByEmail,
    createAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin
}
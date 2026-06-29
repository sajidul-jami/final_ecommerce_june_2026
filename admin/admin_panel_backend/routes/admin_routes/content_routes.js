const express = require('express')
const db = require('../../sql/pool')

const router = express.Router()
const pool = db.promise()

const missingTable = (error) =>
    error?.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error?.message || '')

const missingColumn = (error) =>
    error?.code === 'ER_BAD_FIELD_ERROR' || /unknown column/i.test(error?.message || '')

const toMysqlDateTime = (value) => value ? String(value).replace('T', ' ') : null

const optionalList = (handler) => async (req, res) => {
    try {
        const data = await handler(req)
        res.json({ success: true, data })
    } catch (error) {
        if (missingTable(error) || missingColumn(error)) {
            return res.json({ success: true, data: [] })
        }

        res.status(500).json({ success: false, message: error.message })
    }
}

const optionalWrite = (handler) => async (req, res) => {
    try {
        const data = await handler(req)
        res.json({ success: true, ...data })
    } catch (error) {
        if (missingTable(error) || missingColumn(error)) {
            return res.status(400).json({
                success: false,
                message: 'Please add the improvement SQL for this section first.'
            })
        }

        res.status(500).json({ success: false, message: error.message })
    }
}

router.get('/offers', optionalList(async () => {
    const [rows] = await pool.query(`
        SELECT o.*, p.name AS product_name, p.photo, p.price
        FROM offers o
        LEFT JOIN products p ON p.id = o.product_id
        ORDER BY o.status = 'Active' DESC, o.end_date ASC, o.id DESC
    `)
    return rows
}))

router.post('/offers', optionalWrite(async (req) => {
    const { title, product_id, product_ids, discount_type, discount_value, start_date, end_date, status } = req.body
    const ids = Array.isArray(product_ids) && product_ids.length ? product_ids : [product_id]
    const inserted = []

    for (const id of ids.filter(Boolean)) {
        const [result] = await pool.query(
            `INSERT INTO offers (title, product_id, discount_type, discount_value, start_date, end_date, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [title || '', id, discount_type || 'Percentage', discount_value || 0, toMysqlDateTime(start_date), toMysqlDateTime(end_date), status || 'Active']
        )
        inserted.push(result.insertId)
    }

    return { id: inserted[0], ids: inserted, message: 'Offer saved' }
}))

router.put('/offers/:id', optionalWrite(async (req) => {
    const { title, product_id, discount_type, discount_value, start_date, end_date, status } = req.body
    await pool.query(
        `UPDATE offers
         SET title = ?, product_id = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?, status = ?
         WHERE id = ?`,
        [title || '', product_id, discount_type || 'Percentage', discount_value || 0, toMysqlDateTime(start_date), toMysqlDateTime(end_date), status || 'Active', req.params.id]
    )
    return { message: 'Offer updated' }
}))

router.delete('/offers/:id', optionalWrite(async (req) => {
    await pool.query('DELETE FROM offers WHERE id = ?', [req.params.id])
    return { message: 'Offer deleted' }
}))

router.get('/brands', optionalList(async () => {
    const [rows] = await pool.query('SELECT * FROM brands ORDER BY status = "Active" DESC, name ASC')
    return rows
}))

router.post('/brands', optionalWrite(async (req) => {
    const { name, slug, logo, status } = req.body
    const safeSlug = slug || String(name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const [result] = await pool.query(
        'INSERT INTO brands (name, slug, logo, status) VALUES (?, ?, ?, ?)',
        [name, safeSlug, logo || '', status || 'Active']
    )
    return { id: result.insertId, message: 'Brand saved' }
}))

router.put('/brands/:id', optionalWrite(async (req) => {
    const { name, slug, logo, status } = req.body
    await pool.query(
        'UPDATE brands SET name = ?, slug = ?, logo = ?, status = ? WHERE id = ?',
        [name, slug || '', logo || '', status || 'Active', req.params.id]
    )
    return { message: 'Brand updated' }
}))

router.delete('/brands/:id', optionalWrite(async (req) => {
    await pool.query('DELETE FROM brands WHERE id = ?', [req.params.id])
    return { message: 'Brand deleted' }
}))

router.get('/sliders', optionalList(async () => {
    const [rows] = await pool.query('SELECT * FROM sliders ORDER BY sort_order ASC, id DESC')
    return rows
}))

router.post('/sliders', optionalWrite(async (req) => {
    const { title, subtitle, image_url, button_text, button_link, sort_order, status } = req.body
    const [result] = await pool.query(
        `INSERT INTO sliders (title, subtitle, image_url, button_text, button_link, sort_order, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [title || '', subtitle || '', image_url, button_text || '', button_link || '', sort_order || 0, status || 'Active']
    )
    return { id: result.insertId, message: 'Slider saved' }
}))

router.put('/sliders/:id', optionalWrite(async (req) => {
    const { title, subtitle, image_url, button_text, button_link, sort_order, status } = req.body
    await pool.query(
        `UPDATE sliders
         SET title = ?, subtitle = ?, image_url = ?, button_text = ?, button_link = ?, sort_order = ?, status = ?
         WHERE id = ?`,
        [title || '', subtitle || '', image_url, button_text || '', button_link || '', sort_order || 0, status || 'Active', req.params.id]
    )
    return { message: 'Slider updated' }
}))

router.delete('/sliders/:id', optionalWrite(async (req) => {
    await pool.query('DELETE FROM sliders WHERE id = ?', [req.params.id])
    return { message: 'Slider deleted' }
}))

router.get('/support', optionalList(async () => {
    try {
        const [rows] = await pool.query(`
            SELECT t.*, a.full_name AS assigned_admin_name
            FROM support_tickets t
            LEFT JOIN admins a ON a.id = t.assigned_admin
            ORDER BY FIELD(t.status, 'Open', 'In Progress', 'Resolved', 'Closed'), t.id DESC
        `)
        return rows
    } catch (error) {
        if (!missingColumn(error)) throw error

        const [rows] = await pool.query(`
            SELECT *
            FROM support_tickets
            ORDER BY FIELD(status, 'Open', 'In Progress', 'Resolved', 'Closed'), id DESC
        `)
        return rows
    }
}))

router.put('/support/:id', optionalWrite(async (req) => {
    const { status, admin_note, priority, assigned_admin } = req.body
    try {
        await pool.query(
            `UPDATE support_tickets
             SET status = ?, admin_note = ?, priority = ?, assigned_admin = ?
             WHERE id = ?`,
            [status || 'Open', admin_note || null, priority || 'Medium', assigned_admin || null, req.params.id]
        )
    } catch (error) {
        if (!missingColumn(error)) throw error
        await pool.query(
            'UPDATE support_tickets SET status = ?, admin_note = ? WHERE id = ?',
            [status || 'Open', admin_note || null, req.params.id]
        )
    }
    return { message: 'Support ticket updated' }
}))

router.get('/reviews', optionalList(async () => {
    const [rows] = await pool.query(`
        SELECT r.*, p.name AS product_name, COALESCE(u.full_name, u.user_name, 'Customer') AS reviewer_name
        FROM product_reviews r
        LEFT JOIN products p ON p.id = r.product_id
        LEFT JOIN users u ON u.id = r.user_id
        ORDER BY r.id DESC
    `)
    return rows
}))

router.put('/reviews/:id', optionalWrite(async (req) => {
    const { status, admin_reply } = req.body
    try {
        await pool.query('UPDATE product_reviews SET status = ?, admin_reply = ? WHERE id = ?', [
            status || 'Approved',
            admin_reply || null,
            req.params.id
        ])
    } catch (error) {
        if (!missingColumn(error)) throw error
        await pool.query('UPDATE product_reviews SET status = ? WHERE id = ?', [status || 'Approved', req.params.id])
    }
    return { message: 'Review updated' }
}))

router.get('/social-links', optionalList(async () => {
    const [rows] = await pool.query('SELECT * FROM social_links ORDER BY sort_order ASC, id ASC')
    return rows
}))

router.post('/social-links', optionalWrite(async (req) => {
    const { platform, url, icon, sort_order, status } = req.body
    const [result] = await pool.query(
        'INSERT INTO social_links (platform, url, icon, sort_order, status) VALUES (?, ?, ?, ?, ?)',
        [platform || '', url || '', icon || '', sort_order || 0, status || 'Active']
    )
    return { id: result.insertId, message: 'Social link saved' }
}))

router.put('/social-links/:id', optionalWrite(async (req) => {
    const { platform, url, icon, sort_order, status } = req.body
    await pool.query(
        'UPDATE social_links SET platform = ?, url = ?, icon = ?, sort_order = ?, status = ? WHERE id = ?',
        [platform || '', url || '', icon || '', sort_order || 0, status || 'Active', req.params.id]
    )
    return { message: 'Social link updated' }
}))

router.delete('/social-links/:id', optionalWrite(async (req) => {
    await pool.query('DELETE FROM social_links WHERE id = ?', [req.params.id])
    return { message: 'Social link deleted' }
}))

module.exports = router

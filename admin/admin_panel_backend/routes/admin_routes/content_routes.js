const express = require('express')
const db = require('../../sql/pool')

const router = express.Router()
const pool = db.promise()

const missingTable = (error) =>
    error?.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error?.message || '')

const missingColumn = (error) =>
    error?.code === 'ER_BAD_FIELD_ERROR' || /unknown column/i.test(error?.message || '')

const toMysqlDateTime = (value) => value ? String(value).replace('T', ' ') : null

const slugify = (value = '') =>
    String(value)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'brand'

const uniqueBrandSlug = async (name, requestedSlug = '', excludeId = null) => {
    const baseSlug = slugify(requestedSlug || name)
    let slug = baseSlug
    let suffix = 2

    while (true) {
        const params = [slug]
        let excludeSql = ''

        if (excludeId) {
            excludeSql = ' AND id <> ?'
            params.push(excludeId)
        }

        const [rows] = await pool.query(`SELECT id FROM brands WHERE slug = ?${excludeSql} LIMIT 1`, params)
        if (!rows.length) return slug

        slug = `${baseSlug}-${suffix}`
        suffix += 1
    }
}

const offerSelect = `
    SELECT o.*, p.name AS product_name, p.photo, p.price,
           CASE
             WHEN o.discount_type = 'Percentage'
               THEN GREATEST(p.price - (p.price * LEAST(o.discount_value, 100) / 100), 0)
             ELSE GREATEST(p.price - o.discount_value, 0)
           END AS offer_price
    FROM offers o
    LEFT JOIN products p ON p.id = o.product_id
`

const siteSettingsFields = [
    'website_name',
    'website_logo',
    'footer_logo',
    'favicon',
    'website_description',
    'footer_title',
    'footer_description',
    'footer_quick_links',
    'contact_email',
    'phone',
    'whatsapp',
    'office_address',
    'google_map',
    'support_email',
    'footer_copyright',
    'meta_title',
    'meta_description',
    'meta_keywords',
    'google_analytics',
    'google_tag_manager',
    'facebook_pixel',
    'inside_dhaka_delivery_charge',
    'outside_dhaka_delivery_charge'
]

const normalizeSiteSettingValue = (field, value) => {
    if (field === 'inside_dhaka_delivery_charge') {
        const amount = Number(value)
        return Number.isFinite(amount) && amount >= 0 ? amount : 80
    }

    if (field === 'outside_dhaka_delivery_charge') {
        const amount = Number(value)
        return Number.isFinite(amount) && amount >= 0 ? amount : 120
    }

    return value === undefined || value === null ? '' : String(value)
}

const ensureProductsNotInActiveOffer = async (productIds, excludeOfferId = null) => {
    const ids = [...new Set((productIds || []).map(Number).filter(Boolean))]

    if (ids.length === 0) return

    const params = [...ids]
    let excludeSql = ''

    if (excludeOfferId) {
        excludeSql = ' AND id <> ?'
        params.push(excludeOfferId)
    }

    const [existing] = await pool.query(
        `SELECT id, product_id, title, offer_type
         FROM offers
         WHERE status = 'Active'
           AND product_id IN (${ids.map(() => '?').join(',')})
           ${excludeSql}
         LIMIT 1`,
        params
    )

    if (existing.length) {
        const offer = existing[0]
        throw new Error(`This product is already in ${offer.offer_type || offer.title || 'another active offer'}. Remove or deactivate that offer first.`)
    }
}

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
    let rows

    try {
        ;[rows] = await pool.query(`
            ${offerSelect}
            ORDER BY o.status = 'Active' DESC, o.sort_order ASC, o.end_date IS NULL ASC, o.end_date ASC, o.id DESC
        `)
    } catch (error) {
        if (!missingColumn(error)) throw error
        ;[rows] = await pool.query(`
            SELECT o.*, p.name AS product_name, p.photo, p.price,
                   CASE
                     WHEN o.discount_type = 'Percentage'
                       THEN GREATEST(p.price - (p.price * LEAST(o.discount_value, 100) / 100), 0)
                     ELSE GREATEST(p.price - o.discount_value, 0)
                   END AS offer_price
            FROM offers o
            LEFT JOIN products p ON p.id = o.product_id
            ORDER BY o.status = 'Active' DESC, o.end_date ASC, o.id DESC
        `)
    }

    return rows
}))

router.post('/offers', optionalWrite(async (req) => {
    const {
        title,
        product_id,
        product_ids,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        offer_type,
        badge_text,
        sort_order
    } = req.body
    const ids = (Array.isArray(product_ids) && product_ids.length ? product_ids : [product_id]).map(Number).filter(Boolean)
    const inserted = []

    if ((status || 'Active') === 'Active') {
        await ensureProductsNotInActiveOffer(ids)
    }

    for (const id of ids) {
        const [result] = await pool.query(
            `INSERT INTO offers
             (title, product_id, discount_type, discount_value, start_date, end_date, status, offer_type, badge_text, sort_order)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title || '',
                id,
                discount_type || 'Percentage',
                discount_value || 0,
                toMysqlDateTime(start_date),
                toMysqlDateTime(end_date),
                status || 'Active',
                offer_type || 'Special Offers',
                badge_text || '',
                Number(sort_order || 0)
            ]
        )
        inserted.push(result.insertId)
    }

    return { id: inserted[0], ids: inserted, message: 'Offer saved' }
}))

router.put('/offers/:id', optionalWrite(async (req) => {
    const {
        title,
        product_id,
        discount_type,
        discount_value,
        start_date,
        end_date,
        status,
        offer_type,
        badge_text,
        sort_order
    } = req.body
    if ((status || 'Active') === 'Active') {
        await ensureProductsNotInActiveOffer([product_id], req.params.id)
    }

    await pool.query(
        `UPDATE offers
         SET title = ?, product_id = ?, discount_type = ?, discount_value = ?, start_date = ?, end_date = ?,
             status = ?, offer_type = ?, badge_text = ?, sort_order = ?
         WHERE id = ?`,
        [
            title || '',
            product_id,
            discount_type || 'Percentage',
            discount_value || 0,
            toMysqlDateTime(start_date),
            toMysqlDateTime(end_date),
            status || 'Active',
            offer_type || 'Special Offers',
            badge_text || '',
            Number(sort_order || 0),
            req.params.id
        ]
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
    const { name, slug, logo, description, status, seo_title, seo_description, seo_keywords } = req.body
    const safeSlug = await uniqueBrandSlug(name, slug)
    const [result] = await pool.query(
        `INSERT INTO brands
         (name, slug, logo, description, status, seo_title, seo_description, seo_keywords)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name,
            safeSlug,
            logo || '',
            description || '',
            status || 'Active',
            seo_title || '',
            seo_description || '',
            seo_keywords || ''
        ]
    )
    return { id: result.insertId, slug: safeSlug, message: 'Brand saved' }
}))

router.put('/brands/:id', optionalWrite(async (req) => {
    const { name, slug, logo, description, status, seo_title, seo_description, seo_keywords } = req.body
    const safeSlug = await uniqueBrandSlug(name, slug, req.params.id)
    await pool.query(
        `UPDATE brands
         SET name = ?, slug = ?, logo = ?, description = ?, status = ?,
             seo_title = ?, seo_description = ?, seo_keywords = ?
         WHERE id = ?`,
        [
            name,
            safeSlug,
            logo || '',
            description || '',
            status || 'Active',
            seo_title || '',
            seo_description || '',
            seo_keywords || '',
            req.params.id
        ]
    )
    return { slug: safeSlug, message: 'Brand updated' }
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

router.get('/site-settings', optionalList(async () => {
    const [rows] = await pool.query('SELECT * FROM site_settings WHERE id = 1 LIMIT 1')
    return rows[0] || {}
}))

router.put('/site-settings', optionalWrite(async (req) => {
    const values = siteSettingsFields.map((field) => normalizeSiteSettingValue(field, req.body[field]))
    const updateSql = siteSettingsFields.map((field) => `${field} = VALUES(${field})`).join(', ')

    await pool.query(
        `INSERT INTO site_settings (id, ${siteSettingsFields.join(', ')})
         VALUES (1, ${siteSettingsFields.map(() => '?').join(', ')})
         ON DUPLICATE KEY UPDATE ${updateSql}`,
        values
    )

    return { message: 'Site settings saved' }
}))

module.exports = router

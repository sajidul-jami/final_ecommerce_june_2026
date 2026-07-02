const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3005;
const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_NAME', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
}

const jwtSecret = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  waitForConnections: true,
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
});

const publicUserFields =
  'id, user_name, full_name, email, phone_number, location, address, city, photo, type, status, created_at';

const normalizeProduct = (product) => ({
  ...product,
  price: Number(product.price || 0),
  quantity: Number(product.quantity || 0),
  sold_count: Number(product.sold_count || 0),
  avg_rating: Number(product.avg_rating || 0),
  review_count: Number(product.review_count || 0),
  photo: product.photo || 'noimage.jpg',
  images: Array.isArray(product.images) ? product.images : [],
});

const normalizeSearchTerm = (value = '') =>
  String(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const levenshteinDistance = (a, b) => {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  const current = new Array(b.length + 1);

  for (let i = 1; i <= a.length; i += 1) {
    current[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost
      );
    }

    for (let j = 0; j <= b.length; j += 1) previous[j] = current[j];
  }

  return previous[b.length];
};

const similarityScore = (query, value) => {
  const normalizedQuery = normalizeSearchTerm(query);
  const normalizedValue = normalizeSearchTerm(value);

  if (!normalizedQuery || !normalizedValue) return 0;
  if (normalizedValue === normalizedQuery) return 100;
  if (normalizedValue.startsWith(normalizedQuery)) return 92;
  if (normalizedValue.includes(normalizedQuery)) return 84;

  const queryWords = normalizedQuery.split(' ').filter(Boolean);
  const valueWords = normalizedValue.split(' ').filter(Boolean);
  let best = 0;

  for (const queryWord of queryWords) {
    for (const valueWord of valueWords) {
      if (valueWord === queryWord) best = Math.max(best, 100);
      else if (valueWord.startsWith(queryWord)) best = Math.max(best, 90);
      else if (valueWord.includes(queryWord)) best = Math.max(best, 82);
      else {
        const distance = levenshteinDistance(queryWord, valueWord);
        const maxLength = Math.max(queryWord.length, valueWord.length);
        const score = Math.round((1 - distance / maxLength) * 100);
        best = Math.max(best, score);
      }
    }
  }

  return best;
};

const rankSearchRow = (row, search) => {
  const fields = [
    { type: 'name', value: row.name, weight: 1 },
    { type: 'tag', value: row.tags, weight: 0.98 },
    { type: 'sku', value: row.sku, weight: 0.95 },
    { type: 'brand', value: row.brand_name, weight: 0.9 },
    { type: 'category', value: row.category_name, weight: 0.86 },
    { type: 'description', value: row.description, weight: 0.72 },
  ];
  let best = { score: 0, type: 'fuzzy' };

  fields.forEach((field) => {
    if (!field.value) return;
    const score = Math.round(similarityScore(search, field.value) * field.weight);
    if (score > best.score) {
      best = { score, type: field.type };
    }
  });

  const tagList = String(row.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const matchedTag = tagList
    .map((tag) => ({ tag, score: similarityScore(search, tag) }))
    .sort((a, b) => b.score - a.score)[0];

  return {
    ...row,
    search_score: Math.max(Number(row.sql_search_score || 0), best.score),
    match_type: best.type,
    matched_tag: matchedTag?.score >= 70 ? matchedTag.tag : null,
  };
};

const isMissingTable = (error) =>
  error?.code === 'ER_NO_SUCH_TABLE' || /doesn't exist/i.test(error?.message || '');

const hydrateProductExtras = async (products) => {
  const productList = Array.isArray(products) ? products : [products];
  const productIds = productList.map((product) => Number(product.id)).filter(Boolean);

  if (productIds.length === 0) {
    return products;
  }

  try {
    const [reviewRows] = await pool.query(
      `SELECT product_id, ROUND(AVG(rating), 1) AS avg_rating, COUNT(*) AS review_count
       FROM product_reviews
       WHERE status = 'Approved' AND product_id IN (${productIds.map(() => '?').join(',')})
       GROUP BY product_id`,
      productIds
    );

    const reviews = new Map(reviewRows.map((row) => [Number(row.product_id), row]));
    productList.forEach((product) => {
      const review = reviews.get(Number(product.id));
      product.avg_rating = Number(review?.avg_rating || 0);
      product.review_count = Number(review?.review_count || 0);
    });
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }

  try {
    const [imageRows] = await pool.query(
      `SELECT product_id, image_url, alt_text
       FROM product_images
       WHERE product_id IN (${productIds.map(() => '?').join(',')})
       ORDER BY sort_order ASC, id ASC`,
      productIds
    );

    const imageMap = new Map();
    imageRows.forEach((row) => {
      const id = Number(row.product_id);
      const images = imageMap.get(id) || [];
      images.push({ image_url: row.image_url, alt_text: row.alt_text || '' });
      imageMap.set(id, images);
    });

    productList.forEach((product) => {
      product.images = imageMap.get(Number(product.id)) || [];
    });
  } catch (error) {
    if (!isMissingTable(error)) throw error;
  }

  return products;
};

const optionalRows = async (res, query, params = []) => {
  try {
    const [rows] = await pool.query(query, params);
    return rows;
  } catch (error) {
    if (isMissingTable(error) || error?.code === 'ER_BAD_FIELD_ERROR') {
      return [];
    }

    throw error;
  }
};

const getSafeProductRow = async (id) => {
  let rows;

  try {
    [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, b.name AS brand_name, b.slug AS brand_slug, COALESCE(sold.total_sold, 0) AS sold_count
       FROM products p
       LEFT JOIN category c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS total_sold
         FROM details
         GROUP BY product_id
       ) sold ON sold.product_id = p.id
       WHERE p.id = ? AND (p.status IS NULL OR p.status = 'Active')`,
      [id]
    );
  } catch (error) {
    if (error?.code !== 'ER_BAD_FIELD_ERROR' && error?.code !== 'ER_NO_SUCH_TABLE') throw error;
    [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, COALESCE(sold.total_sold, 0) AS sold_count
       FROM products p
       LEFT JOIN category c ON c.id = p.category_id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS total_sold
         FROM details
         GROUP BY product_id
       ) sold ON sold.product_id = p.id
       WHERE p.id = ? AND (p.status IS NULL OR p.status = 'Active')`,
      [id]
    );
  }

  if (!rows[0]) return null;
  const product = normalizeProduct(rows[0]);
  await hydrateProductExtras(product);
  return product;
};

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, database: 'connected' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.post('/admin-login', async (req, res) => {
  try {
    const { email, phone_number, password } = req.body;
    const loginId = email || phone_number;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    const [admins] = await pool.query(
      'SELECT * FROM admins WHERE (email = ? OR phone = ?) AND status = ? LIMIT 1',
      [loginId, loginId, 'Active']
    );

    const admin = admins[0];
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role, admin: true }, jwtSecret, {
      expiresIn: '7d',
    });

    res.json({ message: 'Admin login success', token, user: admin });
  } catch (error) {
    console.error('Admin login failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    const { phone_number, password, user_name, full_name, email, location, address, city } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    const generatedEmail = email || `${phone_number.replace(/\D/g, '') || Date.now()}@phone.local`;
    const displayName = user_name || full_name || `Customer ${phone_number}`;

    const [existing] = await pool.query(
      'SELECT id FROM users WHERE phone_number = ? OR email = ? LIMIT 1',
      [phone_number, generatedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Phone number or email already in use' });
    }

    const [result] = await pool.query(
      `INSERT INTO users
       (user_name, full_name, email, password, phone_number, location, address, city, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
      [
        displayName,
        full_name || displayName,
        generatedEmail,
        password,
        phone_number,
        location || '',
        address || '',
        city || '',
      ]
    );

    const [created] = await pool.query(`SELECT ${publicUserFields} FROM users WHERE id = ?`, [result.insertId]);
    res.status(201).json({ message: 'Signup successful', userId: result.insertId, user: created[0] });
  } catch (error) {
    console.error('Signup failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { phone_number, email, password } = req.body;
    const loginId = email || phone_number;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Phone/email and password are required' });
    }

    const [rows] = await pool.query(
      `SELECT ${publicUserFields}
       FROM users
       WHERE (phone_number = ? OR email = ?) AND password = ? AND status = 1
       LIMIT 1`,
      [loginId, loginId, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid phone/email or password' });
    }

    res.json({ message: 'Login successful', user: rows[0] });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/update-user', async (req, res) => {
  try {
    const { id, name, user_name, full_name, phone_number, location, address, city, email } = req.body;

    if (!id || !phone_number) {
      return res.status(400).json({ error: 'User id and phone number are required' });
    }

    const displayName = user_name || name || full_name || '';
    const [result] = await pool.query(
      `UPDATE users
       SET user_name = ?, full_name = ?, phone_number = ?, location = ?, address = ?, city = ?, email = COALESCE(?, email)
       WHERE id = ?`,
      [displayName, full_name || displayName, phone_number, location || '', address || '', city || '', email || null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updated] = await pool.query(`SELECT ${publicUserFields} FROM users WHERE id = ?`, [id]);
    res.json({ message: 'User data updated successfully', user: updated[0] });
  } catch (error) {
    console.error('Update user failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:userId/addresses', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'Valid user id is required' });
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, label, recipient_name, phone_number, address_line, city, area, postal_code, is_default, created_at
       FROM user_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, FIELD(label, 'Home', 'Office'), id DESC`,
      [userId]
    );

    res.json(rows);
  } catch (error) {
    if (isMissingTable(error)) {
      return res.json([]);
    }

    console.error('Fetch addresses failed:', error);
    res.status(500).json({ error: 'Error fetching addresses from database' });
  }
});

app.post('/users/:userId/addresses', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const {
      id,
      label = 'Home',
      recipient_name,
      phone_number,
      address_line,
      city,
      area,
      postal_code,
      is_default = false,
    } = req.body;

    if (!userId || !recipient_name || !phone_number || !address_line || !city) {
      return res.status(400).json({ error: 'Name, phone, address and city are required' });
    }

    if (is_default) {
      await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
    }

    if (id) {
      await pool.query(
        `UPDATE user_addresses
         SET label = ?, recipient_name = ?, phone_number = ?, address_line = ?, city = ?, area = ?, postal_code = ?, is_default = ?
         WHERE id = ? AND user_id = ?`,
        [label, recipient_name, phone_number, address_line, city, area || '', postal_code || '', is_default ? 1 : 0, id, userId]
      );
    } else {
      await pool.query(
        `INSERT INTO user_addresses
         (user_id, label, recipient_name, phone_number, address_line, city, area, postal_code, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, label, recipient_name, phone_number, address_line, city, area || '', postal_code || '', is_default ? 1 : 0]
      );
    }

    const [rows] = await pool.query(
      `SELECT id, user_id, label, recipient_name, phone_number, address_line, city, area, postal_code, is_default, created_at
       FROM user_addresses
       WHERE user_id = ?
       ORDER BY is_default DESC, FIELD(label, 'Home', 'Office'), id DESC`,
      [userId]
    );

    res.status(id ? 200 : 201).json({ message: 'Address saved', addresses: rows });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add user_addresses table first' });
    }

    console.error('Save address failed:', error);
    res.status(500).json({ error: 'Error saving address' });
  }
});

app.delete('/users/:userId/addresses/:addressId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const addressId = Number(req.params.addressId);

    if (!userId || !addressId) {
      return res.status(400).json({ error: 'Valid user and address id are required' });
    }

    await pool.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
    res.json({ message: 'Address deleted' });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add user_addresses table first' });
    }

    console.error('Delete address failed:', error);
    res.status(500).json({ error: 'Error deleting address' });
  }
});

app.get('/orders/:userId', async (req, res) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'Valid user id is required' });
    }

    const [rows] = await pool.query(
      `SELECT
         o.id,
         o.customer_id,
         o.total_amount,
         o.payment_method,
         o.order_status,
         o.created_at,
         d.product_id,
         d.quantity,
         d.price,
         p.name AS product_name,
         p.photo AS product_photo,
         pay.payment_status
       FROM orders o
       LEFT JOIN details d ON d.sales_id = o.id
       LEFT JOIN products p ON p.id = d.product_id
       LEFT JOIN payments pay ON pay.order_id = o.id
       WHERE o.customer_id = ?
       ORDER BY o.created_at DESC, o.id DESC`,
      [userId]
    );

    const orderMap = new Map();

    rows.forEach((row) => {
      if (!orderMap.has(row.id)) {
        orderMap.set(row.id, {
          id: row.id,
          customer_id: row.customer_id,
          total_amount: Number(row.total_amount || 0),
          payment_method: row.payment_method,
          order_status: row.order_status || 'Pending',
          payment_status: row.payment_status || 'Unpaid',
          created_at: row.created_at,
          items: [],
        });
      }

      if (row.product_id) {
        orderMap.get(row.id).items.push({
          product_id: row.product_id,
          name: row.product_name,
          photo: row.product_photo || 'noimage.jpg',
          quantity: Number(row.quantity || 0),
          price: Number(row.price || 0),
        });
      }
    });

    res.json(Array.from(orderMap.values()));
  } catch (error) {
    console.error('Fetch orders failed:', error);
    res.status(500).json({ error: 'Error fetching orders from database' });
  }
});

app.get('/categories', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM category ORDER BY cat_code ASC, name ASC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch categories failed:', error);
    res.status(500).json({ error: 'Error fetching categories from database' });
  }
});

app.get('/brands', async (req, res) => {
  try {
    const rows = await optionalRows(
      res,
      `SELECT id, name, slug, logo
       FROM brands
       WHERE status = 'Active'
       ORDER BY name ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch brands failed:', error);
    res.status(500).json({ error: 'Error fetching brands from database' });
  }
});

app.get('/sliders', async (req, res) => {
  try {
    const rows = await optionalRows(
      res,
      `SELECT id, title, subtitle, image_url, button_text, button_link, sort_order
       FROM sliders
       WHERE status = 'Active'
       ORDER BY sort_order ASC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch sliders failed:', error);
    res.status(500).json({ error: 'Error fetching sliders from database' });
  }
});

app.get('/offers', async (req, res) => {
  try {
    const rows = await optionalRows(
      res,
      `SELECT o.id, o.title, o.discount_type, o.discount_value, o.start_date, o.end_date,
              p.*, c.name AS category_name, COALESCE(sold.total_sold, 0) AS sold_count
       FROM offers o
       INNER JOIN products p ON p.id = o.product_id
       LEFT JOIN category c ON c.id = p.category_id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS total_sold
         FROM details
         GROUP BY product_id
       ) sold ON sold.product_id = p.id
       WHERE o.status = 'Active'
         AND (p.status IS NULL OR p.status = 'Active')
         AND (o.start_date IS NULL OR o.start_date <= NOW())
         AND (o.end_date IS NULL OR o.end_date >= NOW())
       ORDER BY o.end_date ASC, o.id DESC
       LIMIT 12`
    );

    const products = rows.map((row) =>
      normalizeProduct({
        ...row,
        offer_id: row.id,
        offer_title: row.title,
        discount_type: row.discount_type,
        discount_value: Number(row.discount_value || 0),
      })
    );
    await hydrateProductExtras(products);
    res.json(products);
  } catch (error) {
    console.error('Fetch offers failed:', error);
    res.status(500).json({ error: 'Error fetching offers from database' });
  }
});

app.get('/social-links', async (req, res) => {
  try {
    const rows = await optionalRows(
      res,
      `SELECT id, platform, url, icon, sort_order
       FROM social_links
       WHERE status = 'Active'
       ORDER BY sort_order ASC, id ASC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Fetch social links failed:', error);
    res.status(500).json({ error: 'Error fetching social links from database' });
  }
});

app.get('/products', async (req, res) => {
  try {
    const { category, brand, search, limit, sort = 'newest' } = req.query;
    const where = ["(p.status IS NULL OR p.status = 'Active')"];
    const params = [];

    if (category) {
      where.push('(p.category_id = ? OR c.cat_slug = ? OR c.cat_code = ? OR c.cat_code LIKE ?)');
      params.push(category, category, category, `${category}-%`);
    }

    if (brand) {
      where.push('(p.brand_id = ? OR b.slug = ? OR b.name = ?)');
      params.push(brand, brand, brand);
    }

    const safeLimit = Math.min(Math.max(Number(limit || 0), 0), 60);
    const normalizedSearch = normalizeSearchTerm(search);
    const candidateLimit = normalizedSearch ? Math.max(safeLimit || 0, 500) : safeLimit;
    const limitSql = candidateLimit ? ` LIMIT ${candidateLimit}` : '';
    const sortOptions = {
      newest: 'p.created_at DESC, p.id DESC',
      best_selling: 'COALESCE(p.counter, 0) DESC, p.created_at DESC, p.id DESC',
      price_asc: 'p.price ASC, p.id DESC',
      price_desc: 'p.price DESC, p.id DESC',
      name_asc: 'p.name ASC, p.id DESC',
    };
    const sqlSearchScore = normalizedSearch
      ? `(
          CASE WHEN LOWER(p.name) = ? THEN 120 ELSE 0 END +
          CASE WHEN LOWER(p.name) LIKE ? THEN 95 ELSE 0 END +
          CASE WHEN LOWER(p.name) LIKE ? THEN 80 ELSE 0 END +
          CASE WHEN LOWER(COALESCE(p.sku, '')) LIKE ? THEN 78 ELSE 0 END +
          CASE WHEN LOWER(COALESCE(c.name, '')) LIKE ? THEN 68 ELSE 0 END +
          CASE WHEN LOWER(COALESCE(b.name, '')) LIKE ? THEN 62 ELSE 0 END +
          CASE WHEN LOWER(COALESCE(tags.tag_search_text, '')) LIKE ? THEN 88 ELSE 0 END +
          CASE WHEN SOUNDEX(p.name) = SOUNDEX(?) THEN 45 ELSE 0 END
        )`
      : '0';
    const sqlSearchParams = normalizedSearch
      ? [
          normalizedSearch,
          `${normalizedSearch}%`,
          `%${normalizedSearch}%`,
          `%${normalizedSearch}%`,
          `%${normalizedSearch}%`,
          `%${normalizedSearch}%`,
          `%${normalizedSearch}%`,
          normalizedSearch,
        ]
      : [];
    const orderSql = normalizedSearch
      ? 'sql_search_score DESC, COALESCE(p.counter, 0) DESC, p.created_at DESC, p.id DESC'
      : sortOptions[sort] || sortOptions.newest;

    let rows;
    try {
      [rows] = await pool.query(
        `SELECT p.*, c.name AS category_name, b.name AS brand_name, b.slug AS brand_slug,
                COALESCE(sold.total_sold, 0) AS sold_count,
                tags.tags,
                ${sqlSearchScore} AS sql_search_score
         FROM products p
         LEFT JOIN category c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand_id
         LEFT JOIN (
           SELECT product_id,
                  GROUP_CONCAT(DISTINCT tag_name ORDER BY tag_name SEPARATOR ', ') AS tags,
                  GROUP_CONCAT(DISTINCT tag_name SEPARATOR ' ') AS tag_search_text
           FROM product_tags
           GROUP BY product_id
         ) tags ON tags.product_id = p.id
         LEFT JOIN (
           SELECT product_id, SUM(quantity) AS total_sold
           FROM details
           GROUP BY product_id
         ) sold ON sold.product_id = p.id
         WHERE ${where.join(' AND ')}
         ORDER BY ${orderSql}${limitSql}`,
        [...sqlSearchParams, ...params]
      );
    } catch (error) {
      if ((error?.code !== 'ER_BAD_FIELD_ERROR' && error?.code !== 'ER_NO_SUCH_TABLE') || brand) throw error;
      const fallbackSearchScore = normalizedSearch
        ? `(
            CASE WHEN LOWER(p.name) = ? THEN 120 ELSE 0 END +
            CASE WHEN LOWER(p.name) LIKE ? THEN 95 ELSE 0 END +
            CASE WHEN LOWER(p.name) LIKE ? THEN 80 ELSE 0 END +
            CASE WHEN LOWER(COALESCE(p.sku, '')) LIKE ? THEN 78 ELSE 0 END +
            CASE WHEN LOWER(COALESCE(c.name, '')) LIKE ? THEN 68 ELSE 0 END +
            CASE WHEN SOUNDEX(p.name) = SOUNDEX(?) THEN 45 ELSE 0 END
          )`
        : '0';
      const fallbackSearchParams = normalizedSearch
        ? [
            normalizedSearch,
            `${normalizedSearch}%`,
            `%${normalizedSearch}%`,
            `%${normalizedSearch}%`,
            `%${normalizedSearch}%`,
            normalizedSearch,
          ]
        : [];
      [rows] = await pool.query(
        `SELECT p.*, c.name AS category_name, COALESCE(sold.total_sold, 0) AS sold_count,
                NULL AS tags, ${fallbackSearchScore} AS sql_search_score
         FROM products p
         LEFT JOIN category c ON c.id = p.category_id
         LEFT JOIN (
           SELECT product_id, SUM(quantity) AS total_sold
           FROM details
           GROUP BY product_id
         ) sold ON sold.product_id = p.id
         WHERE ${where.join(' AND ')}
         ORDER BY ${orderSql}${limitSql}`,
        [...fallbackSearchParams, ...params]
      );
    }

    const rankedRows = normalizedSearch
      ? rows
          .map((row) => rankSearchRow(row, normalizedSearch))
          .filter((row) => row.search_score >= 58)
          .sort((a, b) => b.search_score - a.search_score || Number(b.sold_count || 0) - Number(a.sold_count || 0))
      : rows;
    const products = rankedRows.slice(0, safeLimit || rankedRows.length).map(normalizeProduct);
    await hydrateProductExtras(products);
    res.json(products);
  } catch (error) {
    console.error('Fetch products failed:', error);
    res.status(500).json({ error: 'Error fetching products from database' });
  }
});

app.get('/search-suggestions', async (req, res) => {
  try {
    const search = normalizeSearchTerm(req.query.q || req.query.search || '');
    const safeLimit = Math.min(Math.max(Number(req.query.limit || 8), 1), 12);

    if (!search) {
      return res.json([]);
    }

    const like = `%${search}%`;
    const startsWith = `${search}%`;
    const scoreSql = `(
      CASE WHEN LOWER(p.name) = ? THEN 120 ELSE 0 END +
      CASE WHEN LOWER(p.name) LIKE ? THEN 95 ELSE 0 END +
      CASE WHEN LOWER(p.name) LIKE ? THEN 80 ELSE 0 END +
      CASE WHEN LOWER(COALESCE(p.sku, '')) LIKE ? THEN 78 ELSE 0 END +
      CASE WHEN LOWER(COALESCE(c.name, '')) LIKE ? THEN 68 ELSE 0 END +
      CASE WHEN LOWER(COALESCE(b.name, '')) LIKE ? THEN 62 ELSE 0 END +
      CASE WHEN LOWER(COALESCE(tags.tag_search_text, '')) LIKE ? THEN 88 ELSE 0 END +
      CASE WHEN SOUNDEX(p.name) = SOUNDEX(?) THEN 45 ELSE 0 END
    )`;
    const scoreParams = [search, startsWith, like, like, like, like, like, search];

    let rows;
    try {
      [rows] = await pool.query(
        `SELECT p.id, p.name, p.price, p.photo, p.sku,
                c.name AS category_name, b.name AS brand_name,
                COALESCE(sold.total_sold, 0) AS sold_count,
                tags.tags,
                ${scoreSql} AS sql_search_score
         FROM products p
         LEFT JOIN category c ON c.id = p.category_id
         LEFT JOIN brands b ON b.id = p.brand_id
         LEFT JOIN (
           SELECT product_id,
                  GROUP_CONCAT(DISTINCT tag_name ORDER BY tag_name SEPARATOR ', ') AS tags,
                  GROUP_CONCAT(DISTINCT tag_name SEPARATOR ' ') AS tag_search_text
           FROM product_tags
           GROUP BY product_id
         ) tags ON tags.product_id = p.id
         LEFT JOIN (
           SELECT product_id, SUM(quantity) AS total_sold
           FROM details
           GROUP BY product_id
         ) sold ON sold.product_id = p.id
         WHERE (p.status IS NULL OR p.status = 'Active')
         ORDER BY sql_search_score DESC, COALESCE(p.counter, 0) DESC, p.id DESC
         LIMIT 500`,
        scoreParams
      );
    } catch (error) {
      if (error?.code !== 'ER_BAD_FIELD_ERROR' && error?.code !== 'ER_NO_SUCH_TABLE') throw error;
      const fallbackScoreSql = `(
        CASE WHEN LOWER(p.name) = ? THEN 120 ELSE 0 END +
        CASE WHEN LOWER(p.name) LIKE ? THEN 95 ELSE 0 END +
        CASE WHEN LOWER(p.name) LIKE ? THEN 80 ELSE 0 END +
        CASE WHEN LOWER(COALESCE(p.sku, '')) LIKE ? THEN 78 ELSE 0 END +
        CASE WHEN LOWER(COALESCE(c.name, '')) LIKE ? THEN 68 ELSE 0 END +
        CASE WHEN SOUNDEX(p.name) = SOUNDEX(?) THEN 45 ELSE 0 END
      )`;
      [rows] = await pool.query(
        `SELECT p.id, p.name, p.price, p.photo, p.sku,
                c.name AS category_name, NULL AS brand_name,
                COALESCE(sold.total_sold, 0) AS sold_count,
                NULL AS tags, ${fallbackScoreSql} AS sql_search_score
         FROM products p
         LEFT JOIN category c ON c.id = p.category_id
         LEFT JOIN (
           SELECT product_id, SUM(quantity) AS total_sold
           FROM details
           GROUP BY product_id
         ) sold ON sold.product_id = p.id
         WHERE (p.status IS NULL OR p.status = 'Active')
         ORDER BY sql_search_score DESC, COALESCE(p.counter, 0) DESC, p.id DESC
         LIMIT 500`,
        [search, startsWith, like, like, like, search]
      );
    }

    const suggestions = rows
      .map((row) => rankSearchRow(row, search))
      .filter((row) => row.search_score >= 58)
      .sort((a, b) => b.search_score - a.search_score || Number(b.sold_count || 0) - Number(a.sold_count || 0))
      .slice(0, safeLimit)
      .map((row) => ({
        id: row.id,
        name: row.name,
        price: Number(row.price || 0),
        photo: row.photo || 'noimage.jpg',
        category_name: row.category_name || '',
        brand_name: row.brand_name || '',
        matched_tag: row.matched_tag,
        match_type: row.match_type,
        score: row.search_score,
      }));

    res.json(suggestions);
  } catch (error) {
    console.error('Fetch search suggestions failed:', error);
    res.status(500).json({ error: 'Error fetching search suggestions' });
  }
});

app.get('/singleproducts/:id', async (req, res) => {
  try {
    const product = await getSafeProductRow(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (req.query.view !== '0') {
      await pool.query('UPDATE products SET counter = COALESCE(counter, 0) + 1 WHERE id = ?', [req.params.id]);
    }

    res.json(product);
  } catch (error) {
    console.error('Fetch product failed:', error);
    res.status(500).json({ error: 'Error fetching product from database' });
  }
});

app.get('/products/:productId/reviews', async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!productId) {
      return res.status(400).json({ error: 'Valid product id is required' });
    }

    let rows;
    try {
      [rows] = await pool.query(
        `SELECT r.id, r.product_id, r.user_id, r.rating, r.title, r.comment, r.admin_reply, r.is_verified_purchase, r.created_at,
                COALESCE(u.full_name, u.user_name, 'Customer') AS reviewer_name
         FROM product_reviews r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.product_id = ? AND r.status = 'Approved'
         ORDER BY r.created_at DESC, r.id DESC`,
        [productId]
      );
    } catch (error) {
      if (error?.code !== 'ER_BAD_FIELD_ERROR') throw error;
      [rows] = await pool.query(
        `SELECT r.id, r.product_id, r.user_id, r.rating, r.title, r.comment, r.created_at,
                COALESCE(u.full_name, u.user_name, 'Customer') AS reviewer_name
         FROM product_reviews r
         LEFT JOIN users u ON u.id = r.user_id
         WHERE r.product_id = ? AND r.status = 'Approved'
         ORDER BY r.created_at DESC, r.id DESC`,
        [productId]
      );
    }

    res.json(rows);
  } catch (error) {
    if (isMissingTable(error)) {
      return res.json([]);
    }

    console.error('Fetch reviews failed:', error);
    res.status(500).json({ error: 'Error fetching reviews from database' });
  }
});

app.post('/products/:productId/reviews', async (req, res) => {
  try {
    const productId = Number(req.params.productId);
    const { user_id, rating, title, comment } = req.body;
    const safeRating = Math.min(Math.max(Number(rating || 0), 1), 5);

    if (!productId || !user_id || !comment || !safeRating) {
      return res.status(400).json({ error: 'User, rating and review comment are required' });
    }

    await pool.query(
      `INSERT INTO product_reviews (product_id, user_id, rating, title, comment, status)
       VALUES (?, ?, ?, ?, ?, 'Approved')`,
      [productId, user_id, safeRating, title || '', comment]
    );

    res.status(201).json({ message: 'Review submitted' });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add product_reviews table first' });
    }

    console.error('Save review failed:', error);
    res.status(500).json({ error: 'Error saving review' });
  }
});

app.post('/support-tickets', async (req, res) => {
  try {
    const { user_id, name, email, phone_number, subject, message } = req.body;

    if (!name || !phone_number || !subject || !message) {
      return res.status(400).json({ error: 'Name, phone, subject and message are required' });
    }

    await pool.query(
      `INSERT INTO support_tickets (user_id, name, email, phone_number, subject, message, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
      [user_id || null, name, email || '', phone_number, subject, message]
    );

    res.status(201).json({ message: 'Support request submitted' });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add support_tickets table first' });
    }

    console.error('Save support ticket failed:', error);
    res.status(500).json({ error: 'Error saving support request' });
  }
});

const checkoutHandler = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      user_id,
      products,
      payment_method = 'Cash On Delivery',
      delivery_address_id,
      delivery_name,
      delivery_phone,
      delivery_email,
      delivery_address,
      delivery_city,
      delivery_area,
      order_notes,
    } = req.body;

    const customerId = user_id ? Number(user_id) : null;
    const isGuestCheckout = !customerId;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Products are required' });
    }

    if (isGuestCheckout && (!delivery_name || !delivery_phone || !delivery_address || !delivery_city)) {
      return res.status(400).json({ error: 'Name, phone, address and city are required for guest checkout' });
    }

    await connection.beginTransaction();

    const productIds = products.map((item) => Number(item.id || item.product_id)).filter(Boolean);
    const [dbProducts] = await connection.query(
      `SELECT id, name, price, quantity
       FROM products
       WHERE id IN (${productIds.map(() => '?').join(',')}) FOR UPDATE`,
      productIds
    );

    const productMap = new Map(dbProducts.map((item) => [Number(item.id), item]));
    let totalAmount = 0;
    const orderItems = [];

    for (const item of products) {
      const productId = Number(item.id || item.product_id);
      const requestedQty = Math.max(1, Number(item.quantity || 1));
      const product = productMap.get(productId);

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      if (Number(product.quantity) < requestedQty) {
        throw new Error(`${product.name} stock is only ${product.quantity}`);
      }

      const price = Number(product.price);
      totalAmount += price * requestedQty;
      orderItems.push({ productId, quantity: requestedQty, price });
    }

    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (customer_id, total_amount, payment_method, order_status, delivery_address_id, delivery_name, delivery_phone, delivery_email, delivery_address, delivery_city, delivery_area, order_notes, checkout_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        customerId,
        totalAmount,
        payment_method,
        'Pending',
        delivery_address_id || null,
        delivery_name || null,
        delivery_phone || null,
        delivery_email || null,
        delivery_address || null,
        delivery_city || null,
        delivery_area || null,
        order_notes || null,
        isGuestCheckout ? 'guest' : 'user',
      ]
    );

    const orderId = orderResult.insertId;

    // Delivery fields are now saved during insert. The old UPDATE path is kept here for reference.
    // try {
    //   await connection.query(
    //     `UPDATE orders
    //      SET delivery_address_id = ?, delivery_name = ?, delivery_phone = ?, delivery_address = ?, delivery_city = ?
    //      WHERE id = ?`,
    //     [
    //       delivery_address_id || null,
    //       delivery_name || null,
    //       delivery_phone || null,
    //       delivery_address || null,
    //       delivery_city || null,
    //       orderId,
    //     ]
    //   );
    // } catch (error) {
    //   if (error?.code !== 'ER_BAD_FIELD_ERROR') throw error;
    // }

    for (const item of orderItems) {
      await connection.query(
        'INSERT INTO details (sales_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, item.price]
      );
      await connection.query('UPDATE products SET quantity = quantity - ? WHERE id = ?', [
        item.quantity,
        item.productId,
      ]);
    }

    await connection.query(
      'INSERT INTO payments (order_id, transaction_id, amount, payment_status) VALUES (?, ?, ?, ?)',
      [orderId, `COD-${orderId}`, totalAmount, payment_method === 'Cash On Delivery' ? 'Unpaid' : 'Paid']
    );

    if (customerId) {
      await connection.query('DELETE FROM cart WHERE user_id = ?', [customerId]);
    }
    await connection.commit();

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount,
      order_status: 'Pending',
    });
  } catch (error) {
    await connection.rollback();
    console.error('Checkout failed:', error);
    res.status(500).json({ error: error.message || 'Checkout failed' });
  } finally {
    connection.release();
  }
};

app.post('/checkout', checkoutHandler);

// Backward-compatible route for the old frontend name.
app.post('/sales', async (req, res) => {
  req.body.products = req.body.products || [{ id: req.body.product_id, quantity: req.body.quantity || 1 }];
  return checkoutHandler(req, res);
});

app.post('/productadd', async (req, res) => {
  try {
    const { category_id, name, description, slug, price, photo, counter, quantity, sku, status, images = [] } = req.body;

    if (!category_id || !name || !price) {
      return res.status(400).json({ error: 'Category, name and price are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO products
       (category_id, name, price, description, slug, photo, counter, quantity, sku, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        price,
        description || '',
        slug || name.toLowerCase().replace(/\s+/g, '-'),
        photo || 'noimage.jpg',
        counter || 0,
        quantity || 0,
        sku || null,
        status || 'Active',
      ]
    );

    if (Array.isArray(images) && images.length > 0) {
      try {
        for (const [index, image] of images.entries()) {
          const imageUrl = typeof image === 'string' ? image : image.image_url;
          if (!imageUrl) continue;

          await pool.query(
            'INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?)',
            [result.insertId, imageUrl, typeof image === 'string' ? name : image.alt_text || name, index]
          );
        }
      } catch (error) {
        if (!isMissingTable(error)) throw error;
      }
    }

    res.status(201).json({ message: 'Product inserted successfully', productId: result.insertId });
  } catch (error) {
    console.error('Product add failed:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

process.on('SIGINT', async () => {
  await pool.end();
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Ecommerce API listening on port ${port}`);
});

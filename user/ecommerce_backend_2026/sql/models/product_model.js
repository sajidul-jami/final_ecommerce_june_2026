const pool = require('../pool');
const { isMissingTable } = require('../utils');

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

const getProductById = async (id) => {
  const [rows] = await pool.query(
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

  if (!rows[0]) return null;
  const product = normalizeProduct(rows[0]);
  await hydrateProductExtras(product);
  return product;
};

const incrementViewCounter = async (id) => {
  await pool.query('UPDATE products SET counter = COALESCE(counter, 0) + 1 WHERE id = ?', [id]);
};

const listProducts = async ({ category, search, limit, sort = 'newest' }) => {
  const where = ["(p.status IS NULL OR p.status = 'Active')"];
  const params = [];

  if (category) {
    where.push('(p.category_id = ? OR c.cat_slug = ? OR c.cat_code = ? OR c.cat_code LIKE ?)');
    params.push(category, category, category, `${category}-%`);
  }

  if (search) {
    where.push(
      '(p.name LIKE ? OR p.description LIKE ? OR p.sku LIKE ? OR c.name LIKE ? OR c.cat_slug LIKE ? OR c.cat_code LIKE ?)'
    );
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  const safeLimit = Math.min(Math.max(Number(limit || 0), 0), 60);
  const limitSql = safeLimit ? ` LIMIT ${safeLimit}` : '';
  const sortOptions = {
    newest: 'p.created_at DESC, p.id DESC',
    best_selling: 'COALESCE(p.counter, 0) DESC, p.created_at DESC, p.id DESC',
    price_asc: 'p.price ASC, p.id DESC',
    price_desc: 'p.price DESC, p.id DESC',
    name_asc: 'p.name ASC, p.id DESC',
  };
  const orderSql = sortOptions[sort] || sortOptions.newest;

  const [rows] = await pool.query(
    `SELECT p.*, c.name AS category_name, COALESCE(sold.total_sold, 0) AS sold_count
     FROM products p
     LEFT JOIN category c ON c.id = p.category_id
     LEFT JOIN (
       SELECT product_id, SUM(quantity) AS total_sold
       FROM details
       GROUP BY product_id
     ) sold ON sold.product_id = p.id
     WHERE ${where.join(' AND ')}
     ORDER BY ${orderSql}${limitSql}`,
    params
  );

  const products = rows.map(normalizeProduct);
  await hydrateProductExtras(products);
  return products;
};

const createProduct = async (data) => {
  const [result] = await pool.query(
    `INSERT INTO products
     (category_id, name, price, description, slug, photo, counter, quantity, sku, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.category_id,
      data.name,
      data.price,
      data.description || '',
      data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      data.photo || 'noimage.jpg',
      data.counter || 0,
      data.quantity || 0,
      data.sku || null,
      data.status || 'Active',
    ]
  );

  if (Array.isArray(data.images) && data.images.length > 0) {
    try {
      for (const [index, image] of data.images.entries()) {
        const imageUrl = typeof image === 'string' ? image : image.image_url;
        if (!imageUrl) continue;

        await pool.query(
          'INSERT INTO product_images (product_id, image_url, alt_text, sort_order) VALUES (?, ?, ?, ?)',
          [result.insertId, imageUrl, typeof image === 'string' ? data.name : image.alt_text || data.name, index]
        );
      }
    } catch (error) {
      if (!isMissingTable(error)) throw error;
    }
  }

  return result.insertId;
};

module.exports = {
  normalizeProduct,
  hydrateProductExtras,
  getProductById,
  incrementViewCounter,
  listProducts,
  createProduct,
};

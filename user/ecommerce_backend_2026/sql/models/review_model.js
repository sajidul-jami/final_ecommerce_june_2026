const pool = require('../pool');

const getApprovedReviewsByProductId = async (productId) => {
  const [rows] = await pool.query(
    `SELECT r.id, r.product_id, r.user_id, r.rating, r.title, r.comment, r.created_at,
            COALESCE(u.full_name, u.user_name, 'Customer') AS reviewer_name
     FROM product_reviews r
     LEFT JOIN users u ON u.id = r.user_id
     WHERE r.product_id = ? AND r.status = 'Approved'
     ORDER BY r.created_at DESC, r.id DESC`,
    [productId]
  );
  return rows;
};

const createReview = async ({ productId, userId, rating, title, comment }) => {
  await pool.query(
    `INSERT INTO product_reviews (product_id, user_id, rating, title, comment, status)
     VALUES (?, ?, ?, ?, ?, 'Approved')`,
    [productId, userId, rating, title || '', comment]
  );
};

module.exports = { getApprovedReviewsByProductId, createReview };

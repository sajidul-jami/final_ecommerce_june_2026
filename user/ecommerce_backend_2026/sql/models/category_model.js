const pool = require('../pool');

const getAllCategories = async () => {
  const [rows] = await pool.query('SELECT * FROM category ORDER BY cat_code ASC, name ASC');
  return rows;
};

module.exports = { getAllCategories };

const pool = require('../pool');

const ADDRESS_FIELDS =
  'id, user_id, label, recipient_name, phone_number, address_line, city, area, postal_code, is_default, created_at';

const listByUserId = async (userId) => {
  const [rows] = await pool.query(
    `SELECT ${ADDRESS_FIELDS}
     FROM user_addresses
     WHERE user_id = ?
     ORDER BY is_default DESC, FIELD(label, 'Home', 'Office'), id DESC`,
    [userId]
  );
  return rows;
};

const clearDefaultForUser = async (userId) => {
  await pool.query('UPDATE user_addresses SET is_default = 0 WHERE user_id = ?', [userId]);
};

const updateAddress = async (userId, addressId, data) => {
  await pool.query(
    `UPDATE user_addresses
     SET label = ?, recipient_name = ?, phone_number = ?, address_line = ?, city = ?, area = ?, postal_code = ?, is_default = ?
     WHERE id = ? AND user_id = ?`,
    [
      data.label,
      data.recipient_name,
      data.phone_number,
      data.address_line,
      data.city,
      data.area || '',
      data.postal_code || '',
      data.is_default ? 1 : 0,
      addressId,
      userId,
    ]
  );
};

const insertAddress = async (userId, data) => {
  await pool.query(
    `INSERT INTO user_addresses
     (user_id, label, recipient_name, phone_number, address_line, city, area, postal_code, is_default)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      data.label,
      data.recipient_name,
      data.phone_number,
      data.address_line,
      data.city,
      data.area || '',
      data.postal_code || '',
      data.is_default ? 1 : 0,
    ]
  );
};

const deleteAddress = async (userId, addressId) => {
  await pool.query('DELETE FROM user_addresses WHERE id = ? AND user_id = ?', [addressId, userId]);
};

module.exports = {
  listByUserId,
  clearDefaultForUser,
  updateAddress,
  insertAddress,
  deleteAddress,
};

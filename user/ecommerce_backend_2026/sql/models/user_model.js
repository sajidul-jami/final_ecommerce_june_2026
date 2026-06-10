const bcrypt = require('bcrypt');
const pool = require('../pool');

const PUBLIC_USER_FIELDS =
  'id, user_name, full_name, email, phone_number, location, address, city, photo, type, status, created_at';

const BCRYPT_HASH_PREFIX = /^\$2[aby]\$/;

const hashPassword = (password) => bcrypt.hash(password, 10);

const verifyPassword = async (plain, stored) => {
  if (BCRYPT_HASH_PREFIX.test(stored)) {
    return bcrypt.compare(plain, stored);
  }
  return plain === stored;
};

const upgradePasswordHash = async (userId, plainPassword) => {
  const hashed = await hashPassword(plainPassword);
  await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
};

const findAdminByLogin = async (loginId) => {
  const [rows] = await pool.query(
    'SELECT * FROM admins WHERE (email = ? OR phone = ?) AND status = ? LIMIT 1',
    [loginId, loginId, 'Active']
  );
  return rows[0] || null;
};

const findUserByPhoneOrEmail = async (phoneOrEmail) => {
  const [rows] = await pool.query(
    `SELECT password, ${PUBLIC_USER_FIELDS}
     FROM users
     WHERE (phone_number = ? OR email = ?) AND status = 1
     LIMIT 1`,
    [phoneOrEmail, phoneOrEmail]
  );
  return rows[0] || null;
};

const findExistingUser = async (phoneNumber, email) => {
  const [rows] = await pool.query(
    'SELECT id FROM users WHERE phone_number = ? OR email = ? LIMIT 1',
    [phoneNumber, email]
  );
  return rows[0] || null;
};

const createUser = async (data) => {
  const hashedPassword = await hashPassword(data.password);
  const [result] = await pool.query(
    `INSERT INTO users
     (user_name, full_name, email, password, phone_number, location, address, city, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
    [
      data.user_name,
      data.full_name,
      data.email,
      hashedPassword,
      data.phone_number,
      data.location || '',
      data.address || '',
      data.city || '',
    ]
  );
  return result.insertId;
};

const getUserById = async (id) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC_USER_FIELDS} FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
};

const updateUser = async (id, data) => {
  const [result] = await pool.query(
    `UPDATE users
     SET user_name = ?, full_name = ?, phone_number = ?, location = ?, address = ?, city = ?, email = COALESCE(?, email)
     WHERE id = ?`,
    [
      data.user_name,
      data.full_name,
      data.phone_number,
      data.location || '',
      data.address || '',
      data.city || '',
      data.email || null,
      id,
    ]
  );
  return result.affectedRows;
};

module.exports = {
  PUBLIC_USER_FIELDS,
  hashPassword,
  verifyPassword,
  upgradePasswordHash,
  findAdminByLogin,
  findUserByPhoneOrEmail,
  findExistingUser,
  createUser,
  getUserById,
  updateUser,
};

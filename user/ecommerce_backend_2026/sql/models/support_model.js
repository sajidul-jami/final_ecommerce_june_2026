const pool = require('../pool');

const createSupportTicket = async (data) => {
  await pool.query(
    `INSERT INTO support_tickets (user_id, name, email, phone_number, subject, message, status)
     VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
    [data.user_id || null, data.name, data.email || '', data.phone_number, data.subject, data.message]
  );
};

module.exports = { createSupportTicket };

const express = require('express');
const { createSupportTicket } = require('../sql/models/support_model');
const { isMissingTable } = require('../sql/utils');

const router = express.Router();

router.post('/support-tickets', async (req, res, next) => {
  try {
    const { user_id, name, email, phone_number, subject, message } = req.body;

    if (!name || !phone_number || !subject || !message) {
      return res.status(400).json({ error: 'Name, phone, subject and message are required' });
    }

    await createSupportTicket({ user_id, name, email, phone_number, subject, message });
    res.status(201).json({ message: 'Support request submitted' });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add support_tickets table first' });
    }
    next(error);
  }
});

module.exports = router;

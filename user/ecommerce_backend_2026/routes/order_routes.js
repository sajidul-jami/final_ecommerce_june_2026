const express = require('express');
const { getOrdersByUserId } = require('../sql/models/order_model');

const router = express.Router();

router.get('/orders/:userId', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'Valid user id is required' });
    }

    const orders = await getOrdersByUserId(userId);
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require('express');
const { checkout } = require('../sql/models/order_model');

const router = express.Router();

const checkoutHandler = async (req, res, next) => {
  try {
    const { user_id, products, payment_method, delivery_address_id, delivery_name, delivery_phone, delivery_address, delivery_city } =
      req.body;

    if (!user_id || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'User and products are required' });
    }

    const { orderId, totalAmount } = await checkout({
      user_id,
      products,
      payment_method,
      delivery_address_id,
      delivery_name,
      delivery_phone,
      delivery_address,
      delivery_city,
    });

    res.status(201).json({
      message: 'Order placed successfully',
      orderId,
      totalAmount,
      order_status: 'Pending',
    });
  } catch (error) {
    console.error('Checkout failed:', error);
    res.status(500).json({ error: error.message || 'Checkout failed' });
  }
};

router.post('/checkout', checkoutHandler);

router.post('/sales', async (req, res, next) => {
  req.body.products = req.body.products || [{ id: req.body.product_id, quantity: req.body.quantity || 1 }];
  return checkoutHandler(req, res, next);
});

module.exports = router;

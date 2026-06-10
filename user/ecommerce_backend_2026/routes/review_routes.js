const express = require('express');
const { getApprovedReviewsByProductId, createReview } = require('../sql/models/review_model');
const { isMissingTable } = require('../sql/utils');

const router = express.Router();

router.get('/products/:productId/reviews', async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);

    if (!productId) {
      return res.status(400).json({ error: 'Valid product id is required' });
    }

    const reviews = await getApprovedReviewsByProductId(productId);
    res.json(reviews);
  } catch (error) {
    if (isMissingTable(error)) {
      return res.json([]);
    }
    next(error);
  }
});

router.post('/products/:productId/reviews', async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const { user_id, rating, title, comment } = req.body;
    const safeRating = Math.min(Math.max(Number(rating || 0), 1), 5);

    if (!productId || !user_id || !comment || !safeRating) {
      return res.status(400).json({ error: 'User, rating and review comment are required' });
    }

    await createReview({ productId, userId: user_id, rating: safeRating, title, comment });
    res.status(201).json({ message: 'Review submitted' });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add product_reviews table first' });
    }
    next(error);
  }
});

module.exports = router;

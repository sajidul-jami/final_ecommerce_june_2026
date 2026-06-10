const express = require('express');
const { getAllCategories } = require('../sql/models/category_model');

const router = express.Router();

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

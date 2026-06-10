const express = require('express');
const {
  getProductById,
  incrementViewCounter,
  listProducts,
  createProduct,
} = require('../sql/models/product_model');

const router = express.Router();

router.get('/products', async (req, res, next) => {
  try {
    const products = await listProducts(req.query);
    res.json(products);
  } catch (error) {
    next(error);
  }
});

router.get('/singleproducts/:id', async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (req.query.view !== '0') {
      await incrementViewCounter(req.params.id);
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post('/productadd', async (req, res, next) => {
  try {
    const { category_id, name, description, slug, price, photo, counter, quantity, sku, status, images = [] } =
      req.body;

    if (!category_id || !name || !price) {
      return res.status(400).json({ error: 'Category, name and price are required' });
    }

    const productId = await createProduct({
      category_id,
      name,
      description,
      slug,
      price,
      photo,
      counter,
      quantity,
      sku,
      status,
      images,
    });

    res.status(201).json({ message: 'Product inserted successfully', productId });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

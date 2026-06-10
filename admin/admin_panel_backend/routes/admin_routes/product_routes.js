const express = require('express');
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct
} = require('../../sql/product_model');


router.get('/', (req, res) => {
    getAllProducts((err, results) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, data: results });
    });
});


router.get('/:id', (req, res) => {
    getProductById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        if (result.length === 0) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }

        res.json({ success: true, data: result[0] });
    });
});


router.post('/add', (req, res) => {
    const { category_id, name, price } = req.body

    if (!category_id || !name || price === undefined || price === null) {
        return res.status(400).json({
            success: false,
            message: 'Category, name and price are required'
        })
    }

    addProduct(req.body, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({
            success: true,
            message: 'Product Added',
            id: result.insertId
        });
    });
});


router.put('/update/:id', (req, res) => {
    const { category_id, name, price } = req.body

    if (!category_id || !name || price === undefined || price === null) {
        return res.status(400).json({
            success: false,
            message: 'Category, name and price are required'
        })
    }

    updateProduct(req.params.id, req.body, (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, message: 'Product Updated' });
    });
});


router.delete('/delete/:id', (req, res) => {
    deleteProduct(req.params.id, (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, message: 'Product Deleted' });
    });
});

module.exports = router;

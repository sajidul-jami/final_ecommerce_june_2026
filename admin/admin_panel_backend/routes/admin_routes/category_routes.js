const express = require('express')
const router = express.Router()

const {
    getAllCategories,
    getCategoryById,
    addCategory,
    updateCategory,
    deleteCategory
} = require('../../sql/category_model')

// =========================
// GET ALL
// =========================
router.get('/', (req, res) => {
    getAllCategories((err, results) => {
        if (err) return res.status(500).json({ success: false, err: err.message })

        res.json({
            success: true,
            data: results
        })
    })
})

// =========================
// GET ONE
// =========================
router.get('/:id', (req, res) => {
    getCategoryById(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ success: false, err: err.message })

        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            })
        }

        res.json({
            success: true,
            data: result[0]
        })
    })
})

// =========================
// ADD
// =========================
router.post('/add', (req, res) => {
    addCategory(req.body, (err, result) => {

        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            })
        }

        res.json({
            success: true,
            message: 'Category added',
            id: result.insertId
        })
    })
})

// =========================
// UPDATE
// =========================
router.put('/update/:id', (req, res) => {
    updateCategory(req.params.id, req.body, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message
            })
        }

        res.json({
            success: true,
            message: 'Category updated'
        })
    })
})

// =========================
// DELETE
// =========================
router.delete('/delete/:id', (req, res) => {
    deleteCategory(req.params.id, (err) => {

        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            })
        }

        res.json({
            success: true,
            message: 'Category deleted'
        })
    })
})

module.exports = router
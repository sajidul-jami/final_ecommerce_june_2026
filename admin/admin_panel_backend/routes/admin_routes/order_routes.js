const express = require('express')
const router = express.Router()

const {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
} = require('../../sql/order_model')


// =========================
// ALL ORDERS
// =========================
router.get('/', (req, res) => {

    getAllOrders((err, results) => {

        if (err) return res.status(500).json(err)

        res.json({
            success: true,
            total: results.length,
            data: results
        })
    })
})


// =========================
// SINGLE ORDER
// =========================
router.get('/:id', (req, res) => {

    getOrderById(req.params.id, (err, results) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: err.message || 'Failed to load order'
            })
        }

        if (!results.length) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            })
        }

        const order = {
            order_id: results[0].order_id,
            full_name: results[0].full_name,
            email: results[0].email,
            phone: results[0].phone,
            address: results[0].address,
            total_amount: results[0].total_amount,
            payment_method: results[0].payment_method,
            order_status: results[0].order_status,
            created_at: results[0].created_at,

            items: results
                .filter((r) => r.product_id)
                .map((r) => ({
                    product_id: r.product_id,
                    product_name: r.product_name,
                    quantity: r.quantity,
                    price: r.price
                }))
        }

        res.json({ success: true, data: order })
    })
})


// =========================
// CREATE ORDER
// =========================
router.post('/', (req, res) => {

    createOrder(req.body, (err, result) => {

        if (err) return res.status(500).json(err)

        res.json({
            success: true,
            order_id: result.insertId
        })
    })
})


// =========================
// UPDATE STATUS
// =========================
router.patch('/:id/status', (req, res) => {

    updateOrderStatus(req.params.id, req.body.order_status, (err) => {

        if (err) return res.status(500).json(err)

        res.json({
            success: true,
            message: 'Status updated'
        })
    })
})


// =========================
// DELETE ORDER
// =========================
router.delete('/:id', (req, res) => {

    deleteOrder(req.params.id, (err) => {

        if (err) return res.status(500).json(err)

        res.json({
            success: true,
            message: 'Order deleted'
        })
    })
})

module.exports = router
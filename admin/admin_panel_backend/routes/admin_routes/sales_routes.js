const express = require('express')
const router = express.Router()

const {
    getTotalSales,
    getRecentSales,
    getPaymentAnalytics
} = require('../../sql/sales_model')


// =========================
// TOTAL SALES
// =========================
router.get('/summary', (req, res) => {

    getTotalSales((err, result) => {

        if (err) return res.status(500).json(err)

        res.json({
            success: true,
            total_sales: result[0].total_sales || 0
        })
    })
})


// =========================
// RECENT SALES
// =========================
router.get('/recent', (req, res) => {

    getRecentSales((err, result) => {

        if (err) return res.status(500).json(err)

        res.json({
            success: true,
            total: result.length,
            data: result
        })
    })
})


// =========================
// PAYMENT ANALYTICS
// =========================
router.get('/payment-method', (req, res) => {

    getPaymentAnalytics((err, result) => {

        if (err) return res.status(500).json(err)

        res.json({
            success: true,
            data: result
        })
    })
})

module.exports = router
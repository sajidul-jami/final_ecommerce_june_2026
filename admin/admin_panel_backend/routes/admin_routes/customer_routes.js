const express = require('express')
const router = express.Router()

const {
    getAllCustomers
} = require('../../sql/customer_model')

router.get('/', (req, res) => {
    getAllCustomers((err, results) => {
        if (err) return res.status(500).json({ success: false, err })

        res.json({
            success: true,
            total: results.length,
            data: results
        })
    })
})

module.exports = router

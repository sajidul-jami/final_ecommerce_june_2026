const express = require('express')
const router = express.Router()

const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const {
    findAdminByEmail,
    createAdmin,
    getAllAdmins,
    updateAdmin,
    deleteAdmin
} = require('../../sql/admin_model')


// =========================================
// GET ALL ADMINS
// =========================================
router.get('/admins', (req, res) => {

    getAllAdmins((err, admins) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch admins'
            })
        }

        return res.json(admins)
    })
})

// ============================
// UPDATE ADMIN
// ============================
router.put('/admins/:id', (req, res) => {

    const { id } = req.params

    updateAdmin(id, req.body, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update admin'
            })
        }

        res.json({
            success: true,
            message: 'Admin updated successfully'
        })
    })
})


// ============================
// DELETE ADMIN
// ============================
router.delete('/admins/:id', (req, res) => {

    const { id } = req.params

    deleteAdmin(id, (err) => {

        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to delete admin'
            })
        }

        res.json({
            success: true,
            message: 'Admin deleted successfully'
        })
    })
})


// =========================================
// CREATE ADMIN (REGISTER)
// =========================================
router.post('/register', async (req, res) => {

    const {
        full_name,
        email,
        password,
        role,
        phone
    } = req.body

    try {

        findAdminByEmail(email, async (err, result) => {

            if (err) {
                return res.status(500).json(err)
            }

            if (result.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Admin already exists'
                })
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            const adminData = {
                full_name,
                email,
                password: hashedPassword,
                role: role || 'Manager',
                phone
            }

            createAdmin(adminData, (err2, result2) => {

                if (err2) {
                    return res.status(500).json(err2)
                }

                res.json({
                    success: true,
                    message: 'Admin created successfully',
                    adminId: result2.insertId
                })
            })
        })

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: 'Server error',
            error
        })
    }
})


// =========================================
// LOGIN
// =========================================
router.post('/login', (req, res) => {

    const { email, password } = req.body

    findAdminByEmail(email, async (err, result) => {

        if (err) {
            return res.status(500).json(err)
        }

        if (!result.length) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            })
        }

        const admin = result[0]

        const isMatch = await bcrypt.compare(
            password,
            admin.password
        )

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            })
        }

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                role: admin.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.json({
            success: true,
            message: 'Login successful',
            admin: {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                full_name: admin.full_name
            }
        })

        console.log('Admin logged in:', admin.email)
    })
})


// =========================================
// LOGOUT
// =========================================
router.post('/logout', (req, res) => {

    res.clearCookie('token')

    res.json({
        success: true,
        message: 'Logout successful'
    })
})

module.exports = router
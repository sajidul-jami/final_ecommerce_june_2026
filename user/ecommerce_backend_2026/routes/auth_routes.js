const express = require('express');
const jwt = require('jsonwebtoken');
const {
  findAdminByLogin,
  findUserByPhoneOrEmail,
  findExistingUser,
  createUser,
  getUserById,
  updateUser,
  verifyPassword,
  upgradePasswordHash,
} = require('../sql/models/user_model');

const router = express.Router();
const jwtSecret = process.env.JWT_SECRET;

router.post('/admin-login', async (req, res, next) => {
  try {
    const { email, phone_number, password } = req.body;
    const loginId = email || phone_number;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    const admin = await findAdminByLogin(loginId);
    if (!admin || admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role, admin: true }, jwtSecret, {
      expiresIn: '7d',
    });

    res.json({ message: 'Admin login success', token, user: admin });
  } catch (error) {
    next(error);
  }
});

router.post('/signup', async (req, res, next) => {
  try {
    const { phone_number, password, user_name, full_name, email, location, address, city } = req.body;

    if (!phone_number || !password) {
      return res.status(400).json({ error: 'Phone number and password are required' });
    }

    const generatedEmail = email || `${phone_number.replace(/\D/g, '') || Date.now()}@phone.local`;
    const displayName = user_name || full_name || `Customer ${phone_number}`;

    const existing = await findExistingUser(phone_number, generatedEmail);
    if (existing) {
      return res.status(409).json({ error: 'Phone number or email already in use' });
    }

    const userId = await createUser({
      user_name: displayName,
      full_name: full_name || displayName,
      email: generatedEmail,
      password,
      phone_number,
      location,
      address,
      city,
    });

    const user = await getUserById(userId);
    res.status(201).json({ message: 'Signup successful', userId, user });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { phone_number, email, password } = req.body;
    const loginId = email || phone_number;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Phone/email and password are required' });
    }

    const user = await findUserByPhoneOrEmail(loginId);
    if (!user) {
      return res.status(401).json({ error: 'Invalid phone/email or password' });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid phone/email or password' });
    }

    if (!/^\$2[aby]\$/.test(user.password)) {
      await upgradePasswordHash(user.id, password);
    }

    const { password: _, ...publicUser } = user;
    res.json({ message: 'Login successful', user: publicUser });
  } catch (error) {
    next(error);
  }
});

router.post('/update-user', async (req, res, next) => {
  try {
    const { id, name, user_name, full_name, phone_number, location, address, city, email } = req.body;

    if (!id || !phone_number) {
      return res.status(400).json({ error: 'User id and phone number are required' });
    }

    const displayName = user_name || name || full_name || '';
    const affectedRows = await updateUser(id, {
      user_name: displayName,
      full_name: full_name || displayName,
      phone_number,
      location,
      address,
      city,
      email,
    });

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = await getUserById(id);
    res.json({ message: 'User data updated successfully', user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

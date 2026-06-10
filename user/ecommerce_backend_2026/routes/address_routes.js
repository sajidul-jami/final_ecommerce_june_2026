const express = require('express');
const addressModel = require('../sql/models/address_model');
const { isMissingTable } = require('../sql/utils');

const router = express.Router();

router.get('/users/:userId/addresses', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);

    if (!userId) {
      return res.status(400).json({ error: 'Valid user id is required' });
    }

    const rows = await addressModel.listByUserId(userId);
    res.json(rows);
  } catch (error) {
    if (isMissingTable(error)) {
      return res.json([]);
    }
    next(error);
  }
});

router.post('/users/:userId/addresses', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const {
      id,
      label = 'Home',
      recipient_name,
      phone_number,
      address_line,
      city,
      area,
      postal_code,
      is_default = false,
    } = req.body;

    if (!userId || !recipient_name || !phone_number || !address_line || !city) {
      return res.status(400).json({ error: 'Name, phone, address and city are required' });
    }

    if (is_default) {
      await addressModel.clearDefaultForUser(userId);
    }

    const addressData = {
      label,
      recipient_name,
      phone_number,
      address_line,
      city,
      area,
      postal_code,
      is_default,
    };

    if (id) {
      await addressModel.updateAddress(userId, id, addressData);
    } else {
      await addressModel.insertAddress(userId, addressData);
    }

    const rows = await addressModel.listByUserId(userId);
    res.status(id ? 200 : 201).json({ message: 'Address saved', addresses: rows });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add user_addresses table first' });
    }
    next(error);
  }
});

router.delete('/users/:userId/addresses/:addressId', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const addressId = Number(req.params.addressId);

    if (!userId || !addressId) {
      return res.status(400).json({ error: 'Valid user and address id are required' });
    }

    await addressModel.deleteAddress(userId, addressId);
    res.json({ message: 'Address deleted' });
  } catch (error) {
    if (isMissingTable(error)) {
      return res.status(500).json({ error: 'Please add user_addresses table first' });
    }
    next(error);
  }
});

module.exports = router;

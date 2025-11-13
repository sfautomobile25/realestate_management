const express = require('express');
const { Unit } = require('../models');
const router = express.Router();

// Get all units
router.get('/', async (req, res) => {
  try {
    const units = await Unit.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(units);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
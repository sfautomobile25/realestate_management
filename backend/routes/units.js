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

// Create new unit - ADD THIS
router.post('/', async (req, res) => {
  try {
    const { unit_number, type, size_sqft, bedrooms, bathrooms, status, price, description } = req.body;
    
    // Validate required fields
    if (!unit_number || !type) {
      return res.status(400).json({ message: 'Unit number and type are required' });
    }

    const unit = await Unit.create({
      unit_number,
      type,
      size_sqft: size_sqft || null,
      bedrooms: bedrooms || null,
      bathrooms: bathrooms || null,
      status: status || 'available',
      price: price || null,
      description: description || null
    });

    res.status(201).json(unit);
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
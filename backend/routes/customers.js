const express = require('express');
const { Customer, Rental, Unit } = require('../models');
const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.findAll({
      include: [{
        model: Rental,
        as: 'Rentals',
        include: [{
          model: Unit,
          as: 'Unit',
          include: ['Building']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single customer
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id, {
      include: [{
        model: Rental,
        as: 'Rentals',
        include: [{
          model: Unit,
          as: 'Unit',
          include: ['Building']
        }]
      }]
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create customer
router.post('/', async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    await customer.update(req.body);
    res.json(customer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
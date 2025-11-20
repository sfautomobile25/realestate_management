const express = require('express');
const { UtilityType, UtilityBill } = require('../models');
const router = express.Router();

// Get all utility types
router.get('/types', async (req, res) => {
  try {
    const utilityTypes = await UtilityType.findAll({
      order: [['name', 'ASC']]
    });
    res.json(utilityTypes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create utility type
router.post('/types', async (req, res) => {
  try {
    const { name, description, default_amount, calculation_type, is_rent } = req.body;
    
    // Validate required fields
    if (!name || !default_amount) {
      return res.status(400).json({ message: 'Name and default amount are required' });
    }

    // Check if name already exists
    const existingType = await UtilityType.findOne({ where: { name } });
    if (existingType) {
      return res.status(400).json({ message: 'Utility type name already exists' });
    }

    const utilityType = await UtilityType.create({
      name,
      description,
      default_amount: parseFloat(default_amount),
      calculation_type: calculation_type || 'fixed',
      is_rent: is_rent || false
    });

    res.status(201).json(utilityType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update utility type
router.put('/types/:id', async (req, res) => {
  try {
    const { name, description, default_amount, calculation_type, is_active } = req.body;
    const utilityType = await UtilityType.findByPk(req.params.id);

    if (!utilityType) {
      return res.status(404).json({ message: 'Utility type not found' });
    }

    // Check if name already exists (excluding current type)
    if (name && name !== utilityType.name) {
      const existingType = await UtilityType.findOne({ 
        where: { name, id: { $ne: utilityType.id } }
      });
      if (existingType) {
        return res.status(400).json({ message: 'Utility type name already exists' });
      }
    }

    await utilityType.update({
      name: name || utilityType.name,
      description: description !== undefined ? description : utilityType.description,
      default_amount: default_amount !== undefined ? parseFloat(default_amount) : utilityType.default_amount,
      calculation_type: calculation_type || utilityType.calculation_type,
      is_active: is_active !== undefined ? is_active : utilityType.is_active
    });

    res.json(utilityType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete utility type
router.delete('/types/:id', async (req, res) => {
  try {
    const utilityType = await UtilityType.findByPk(req.params.id);
    
    if (!utilityType) {
      return res.status(404).json({ message: 'Utility type not found' });
    }

    // Check if utility type has bills
    const billCount = await UtilityBill.count({ 
      where: { utility_type_id: utilityType.id } 
    });
    
    if (billCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete utility type that has existing bills' 
      });
    }

    await utilityType.destroy();
    res.json({ message: 'Utility type deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get utility bills for rental
router.get('/bills/:rentalId', async (req, res) => {
  try {
    const bills = await UtilityBill.findAll({
      where: { rental_id: req.params.rentalId },
      include: [{
        model: UtilityType,
        as: 'UtilityType'
      }],
      order: [['billing_month', 'DESC']]
    });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
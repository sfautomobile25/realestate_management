const express = require('express');
const { Department, Employee } = require('../models');
const router = express.Router();

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.findAll({
      include: [{
        model: Employee,
        as: 'Employees'
      }],
      order: [['name', 'ASC']]
    });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create department
router.post('/', async (req, res) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update department
router.put('/:id', async (req, res) => {
  try {
    const department = await Department.findByPk(req.params.id);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    await department.update(req.body);
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
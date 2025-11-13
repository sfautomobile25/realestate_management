const express = require('express');
const { Project, Building, Unit } = require('../models');
const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [{
        model: Building,
        as: 'Buildings',
        include: [{
          model: Unit,
          as: 'Units'
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create project
router.post('/', async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
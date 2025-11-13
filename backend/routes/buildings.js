const express = require('express');
const { Building, Project, Unit } = require('../models');
const router = express.Router();

// Get all buildings
router.get('/', async (req, res) => {
  try {
    const buildings = await Building.findAll({
      include: [
        {
          model: Project,
          as: 'Project'
        },
        {
          model: Unit,
          as: 'Units'
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get buildings by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const buildings = await Building.findAll({
      where: { project_id: req.params.projectId },
      include: [{
        model: Unit,
        as: 'Units'
      }],
      order: [['name', 'ASC']]
    });
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single building
router.get('/:id', async (req, res) => {
  try {
    const building = await Building.findByPk(req.params.id, {
      include: [
        {
          model: Project,
          as: 'Project'
        },
        {
          model: Unit,
          as: 'Units'
        }
      ]
    });

    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    res.json(building);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create building
router.post('/', async (req, res) => {
  try {
    const building = await Building.create(req.body);
    const newBuilding = await Building.findByPk(building.id, {
      include: [{
        model: Project,
        as: 'Project'
      }]
    });
    res.status(201).json(newBuilding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update building
router.put('/:id', async (req, res) => {
  try {
    const building = await Building.findByPk(req.params.id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    await building.update(req.body);
    res.json(building);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete building
router.delete('/:id', async (req, res) => {
  try {
    const building = await Building.findByPk(req.params.id);
    if (!building) {
      return res.status(404).json({ message: 'Building not found' });
    }

    await building.destroy();
    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
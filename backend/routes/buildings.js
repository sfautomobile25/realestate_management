const express = require('express');
const { Building, Project, Unit } = require('../models');
const router = express.Router();

// Get all buildings with their projects and units
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
    console.error('Error fetching buildings:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get buildings by project ID
router.get('/project/:projectId', async (req, res) => {
  try {
    const buildings = await Building.findAll({
      where: { project_id: req.params.projectId },
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
      order: [['name', 'ASC']]
    });
    res.json(buildings);
  } catch (error) {
    console.error('Error fetching buildings by project:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single building by ID
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
    console.error('Error fetching building:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new building
router.post('/', async (req, res) => {
  try {
    const { name, project_id, floors, total_units, description } = req.body;
    
    // Validate required fields
    if (!name || !project_id) {
      return res.status(400).json({ message: 'Name and project ID are required' });
    }

    const building = await Building.create({
      name,
      project_id,
      floors: floors || null,
      total_units: total_units || null,
      description: description || null
    });

    // Fetch the created building with project info
    const newBuilding = await Building.findByPk(building.id, {
      include: [{
        model: Project,
        as: 'Project'
      }]
    });

    res.status(201).json(newBuilding);
  } catch (error) {
    console.error('Error creating building:', error);
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
    console.error('Error updating building:', error);
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

    // Check if building has units
    const unitsCount = await Unit.count({ where: { building_id: building.id } });
    if (unitsCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete building that has units. Please delete all units first.' 
      });
    }

    await building.destroy();
    res.json({ message: 'Building deleted successfully' });
  } catch (error) {
    console.error('Error deleting building:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
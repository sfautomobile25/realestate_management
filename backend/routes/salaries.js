const express = require('express');
const { Salary, Employee, Department } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Get all salaries
router.get('/', async (req, res) => {
  try {
    const { month, status } = req.query;
    const whereCondition = {};

    if (month) {
      const startDate = new Date(month);
      const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
      whereCondition.month = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (status) {
      whereCondition.status = status;
    }

    const salaries = await Salary.findAll({
      where: whereCondition,
      include: [{
        model: Employee,
        as: 'Employee',
        include: [{
          model: Department,
          as: 'Department'
        }]
      }],
      order: [['month', 'DESC']]
    });
    res.json(salaries);
  } catch (error) {
    console.error('Error fetching salaries:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark salary as paid
router.put('/:id/pay', async (req, res) => {
  try {
    const salary = await Salary.findByPk(req.params.id);
    if (!salary) {
      return res.status(404).json({ message: 'Salary record not found' });
    }

    await salary.update({
      status: 'paid',
      paid_date: new Date(),
      payment_method: req.body.payment_method || 'bank_transfer'
    });

    res.json(salary);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payroll summary
router.get('/summary', async (req, res) => {
  try {
    const { month } = req.query;
    const currentMonth = month ? new Date(month) : new Date();
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const salaries = await Salary.findAll({
      where: {
        month: {
          [Op.between]: [startDate, endDate]
        }
      },
      include: [{
        model: Employee,
        as: 'Employee'
      }]
    });

    const summary = {
      total_employees: salaries.length,
      total_basic_salary: salaries.reduce((sum, s) => sum + parseFloat(s.basic_salary), 0),
      total_allowances: salaries.reduce((sum, s) => sum + parseFloat(s.allowances), 0),
      total_deductions: salaries.reduce((sum, s) => sum + parseFloat(s.deductions), 0),
      total_bonus: salaries.reduce((sum, s) => sum + parseFloat(s.bonus), 0),
      total_tax: salaries.reduce((sum, s) => sum + parseFloat(s.tax), 0),
      total_net_salary: salaries.reduce((sum, s) => sum + parseFloat(s.net_salary), 0),
      paid_salaries: salaries.filter(s => s.status === 'paid').length,
      pending_salaries: salaries.filter(s => s.status === 'pending').length
    };

    res.json(summary);
  } catch (error) {
    console.error('Error fetching payroll summary:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
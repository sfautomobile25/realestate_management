const express = require('express');
const { Employee, Department, Salary, Attendance } = require('../models');
const { Op } = require('sequelize');
const router = express.Router();

// Generate employee ID
const generateEmployeeId = async () => {
  const year = new Date().getFullYear();
  const lastEmployee = await Employee.findOne({
    order: [['employee_id', 'DESC']],
    where: {
      employee_id: {
        [Op.like]: `EMP${year}%`
      }
    }
  });

  let sequence = 1;
  if (lastEmployee) {
    const lastSequence = parseInt(lastEmployee.employee_id.slice(-4));
    sequence = lastSequence + 1;
  }

  return `EMP${year}${sequence.toString().padStart(4, '0')}`;
};

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.findAll({
      include: [{
        model: Department,
        as: 'Department'
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id, {
      include: [
        {
          model: Department,
          as: 'Department'
        },
        {
          model: Salary,
          as: 'Salaries',
          limit: 6,
          order: [['month', 'DESC']]
        }
      ]
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create employee
router.post('/', async (req, res) => {
  try {
    const employeeId = await generateEmployeeId();
    const employeeData = {
      ...req.body,
      employee_id: employeeId
    };

    const employee = await Employee.create(employeeData);
    const newEmployee = await Employee.findByPk(employee.id, {
      include: [{
        model: Department,
        as: 'Department'
      }]
    });

    res.status(201).json(newEmployee);
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    await employee.update(req.body);
    res.json(employee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get employee salary history
router.get('/:id/salaries', async (req, res) => {
  try {
    const salaries = await Salary.findAll({
      where: { employee_id: req.params.id },
      order: [['month', 'DESC']]
    });
    res.json(salaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Process salary for employee
router.post('/:id/process-salary', async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const { month, allowances = 0, deductions = 0, bonus = 0, overtime = 0, notes } = req.body;
    
    // Calculate tax (simplified calculation)
    const taxableIncome = employee.salary + parseFloat(allowances) + parseFloat(bonus) - parseFloat(deductions);
    const tax = Math.max(0, (taxableIncome - 50000) * 0.1); // 10% tax above 50,000

    const netSalary = employee.salary + parseFloat(allowances) + parseFloat(bonus) + parseFloat(overtime) - parseFloat(deductions) - tax;

    const salary = await Salary.create({
      employee_id: employee.id,
      month: month,
      basic_salary: employee.salary,
      allowances: parseFloat(allowances),
      deductions: parseFloat(deductions),
      bonus: parseFloat(bonus),
      overtime: parseFloat(overtime),
      tax: tax,
      net_salary: netSalary,
      notes: notes
    });

    res.status(201).json(salary);
  } catch (error) {
    console.error('Error processing salary:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;